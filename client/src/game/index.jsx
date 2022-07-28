import { BrickRuntime } from '../content/brickLib';

const STATE_TYPES = {
	state: 0,
	delay: 1,
	timer: 2,
};

const objectToArray = (obj) => {
	return Object.entries(obj).map(([key, value]) => {
		return { key, value };
	});
};

export class Session {
	start() {
		this.game.start(this.layoutPresets, this.nfts);
	}

	constructor(data) {
		this.content = data.content;
		this.runtime = new BrickRuntime(data.content.web);
		this.game = new Game(this);
		this.players = data.players;
		this.nfts = data.nfts
		this.log = data.log ?? [];
		this.seed = data.seed ?? 1;
		this.step = 0;
		this.mode = data.mode ?? 'local';
		this.layoutPresets = data.layoutPresets ?? [];
	}

	applyCommand = (command) => {
		if (command.command_data_type === 0) {
			return this.game.objectEvent(command.object_id, 'action_on_left_click');
		}
		if (command.command_data_type === 1) {
			return this.game.objectEvent(command.object_id, 'action_on_right_click');
		}
		if (command.command_data_type === 2) {
			return this.game.dropCard(command.object_id, command.drag_drop_id, command.target_place_id);
		}
	}

	updateLog = (log) => {
		this.log = log; // TODO
		while (this.step < log.length) {
			this.applyCommand(log[this.step]);
			this.step++;
		}
	}

	onPlayerCommand = (command) => {
		if (this.mode === 'local') {
			this.log.push(command);
			this.updateLog(this.log)
		}
		
	};
}

export class Game {
	objects = {};
	attrs = {};
	diff = undefined;
	diffLog = undefined;

	constructor(game) {
		this.game = game;
		this.content = game.content.web;
		this.runtime = new BrickRuntime(this.content);
		for (let attr of Object.values(this.content.gameAttributes)) {
			this.attrs[attr.code] = 0;
		}
	}

	start = (layoutPresets, nfts) => {
		if (!layoutPresets) throw new Error('Error: Trying to initLayout without preset scheme');
		for (let cardPack of Object.values(this.content.cards)) {
			if (!layoutPresets.includes(cardPack.preset)) continue;
			for (let i = 0; i < cardPack.amount; i++) {
				this.createEntity(cardPack.cardType, cardPack.place, cardPack.initializer);
			}
		}
		if (this.content.collections) {
			for (let nft of nfts) {
				let collection = Object.values(this.content.collections)
					.find(obj => obj.fields.collection === nft.collection);
				if (!collection) continue;
				let obj = this.createEntity(collection.cardType, collection.place, collection.initAction);
			}
		}
		this.startDiff(true);
		this.closeDiff();
	};

	objectEvent = (objectId, event) => {
		this.diffLog = [];
		this.startDiff(true);
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to use unexistent object!');
		let ctx = this.createContext(object);
		let cardType = this.content.cardTypes[object.tplId];
		if (cardType[event]) {
			this.runtime.execBrick(cardType[event], ctx);
		}
		this.closeDiff();
	};

	dropCard = (objectId, dragAndDropId, targetPlace) => {
		this.diffLog = [];
		this.startDiff(true);
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to use unexistent object!');
		let ctx = this.createContext(object, {
			vars: { target_place: targetPlace },
		});
		let dragndrop = this.content.dragNDrops[dragAndDropId];
		if (dragndrop.actionOnDrop) {
			this.runtime.execBrick(dragndrop.actionOnDrop, ctx);
		}
		this.closeDiff();
	};

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error('Error trying to set unknown game attr ' + attr);
		this.attrs[attr] = value;
		this.onGameAttrChanged(attr, value);
	}

	createEntity(cardTypeId, place, initAction, ctx) {
		let id = Object.values(this.objects).length + 1;
		let entity = new Entity(id, cardTypeId, this);
		this.objects[id] = entity;
		if (!place) throw new Error('Game.createEntity error: No place given for created entity!');
		entity.setAttr('place', place);
		let cardType = this.content.cardTypes[cardTypeId];
		if (!cardType) throw new Error('Game.createEntity error: Unknown cardType!');
		if (cardType.action_on_create) {
			this.runtime.execBrick(cardType.action_on_create, this.createContext(entity, ctx));
		}
		if (initAction) {
			this.runtime.execBrick(initAction, this.createContext(entity, ctx));
		}
		return entity;
	}

	createContext(object, extra = {}) {
		extra.game = this;
		return this.runtime.context(object, extra);
	}

	onEntityTransform(entity) {
		if (!this.diff) this.startDiff();
		if (!this.diff.objects[entity.id]) {
			this.diff.objects[entity.id] = {
				id: entity.id,
				attrs: {},
			};
		}
		this.diff.objects[entity.id].tplId = entity.tplId;
	}

	onEntityAttrChanged(entity, attr, value) {
		if (!this.diff) this.startDiff();
		if (!this.diff.objects[entity.id]) {
			this.diff.objects[entity.id] = {
				id: entity.id,
				tplId: entity.tplId,
				attrs: {},
			};
		}
		this.diff.objects[entity.id].attrs[attr] = value;
	}

	onGameAttrChanged(attr, value) {
		if (!this.diff) this.startDiff();
		this.diff.attrs[attr] = value;
	}

	startDiff(full = false) {
		let diff = {
			attrs: {},
			objects: {},
		};
		if (full) {
			Object.assign(diff.attrs, this.attrs);
			for (let obj of Object.values(this.objects)) {
				diff.objects[obj.id] = {
					id: obj.id,
					tplId: obj.tplId,
					attrs: Object.assign({}, obj.attrs),
				};
			}
		}
		this.diff = diff;
	}

	closeDiff() {
		if (!this.diff) return;
		let value = {
			attrs: objectToArray(this.diff.attrs),
			objects: Object.values(this.diff.objects).map((object) => {
				return {
					id: object.id,
					tplId: object.tplId,
					attrs: objectToArray(object.attrs),
				};
			}),
		};
		if (!this.diffLog) this.diffLog = [];
		this.diffLog.push({
			state_type: STATE_TYPES.state,
			value,
		});
		this.diff = undefined;
	}

	animate(duration) {
		this.closeDiff();
		this.diffLog.push({
			state_type: STATE_TYPES.delay,
			value: {
				delay: duration,
			},
		});
	}

	startTimer(object, duration) {
		this.diffLog.push({
			state_type: STATE_TYPES.timer,
			value: {
				object_id: object.id,
				start: true,
				duration,
			},
		});
	}

	stopTimer(object) {
		this.diffLog.push({
			state_type: STATE_TYPES.timer,
			value: {
				object_id: object.id,
				start: false,
			},
		});
	}
}

class Entity {
	id = undefined;
	tplId = undefined;
	game = undefined;

	constructor(id, tplId, game) {
		this.id = id;
		this.tplId = tplId;
		this.attrs = {};
		this.game = game;
		for (let attr of Object.values(game.content.attributes)) {
			this.setAttr(attr.code, 0, true);
		}
	}

	setAttr(attr, value, init = false) {
		if (this.attrs[attr] === undefined && !init) throw new Error(`trying to set unknown entity attr [${attr}]`);
		this.attrs[attr] = value;
		this.game.onEntityAttrChanged(this, attr, value);
	}

	transform(tplId) {
		this.tplId = tplId;
		this.game.onEntityTransform(this);
	}
}
