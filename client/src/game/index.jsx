import { BrickRuntime } from '../content/brickLib';

const objectToArray = (obj) => {
	return Object.entries(obj).map(([key, value]) => {
		return { key, value };
	});
};

export class Session {
	content = undefined;
	game = undefined;
	runtime = undefined;
	seed = 1; // TODO
	players = [];

	start(layoutPresets) {
		this.game.start(layoutPresets);
	}

	constructor(content, players, log = []) {
		this.content = content;
		this.log = log;
		this.players = players;
		this.runtime = new BrickRuntime(content.web);
		this.seed = Math.floor(Math.random() * 1000);
		this.game = new Game(this); //TODO
	}

	handlePlayerCommand = (command) => {
		this.log.push(command);
		if (command.command_data_type === 0 ) {
			return this.game.objectEvent(command.object_id, 'action_on_left_click');
		}
		if (command.command_data_type === 1 ) {
			return this.game.objectEvent(command.object_id, 'action_on_right_click');
		}
		if (command.command_data_type === 2) {
			return this.game.dropCard(command.object_id, command.drag_drop_id, command.target_place_id);
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

	start = (layoutPresets) => {
		if (!layoutPresets) throw new Error('Error: Trying to initLayout without preset scheme');
		for (let cardPack of Object.values(this.content.cards)) {
			if (!layoutPresets.includes(cardPack.preset)) continue;
			for (let i = 0; i < cardPack.amount; i++) {
				let obj = this.createEntity(cardPack.cardType);
				obj.setAttr('place', cardPack.place);
				if (cardPack.initializer) {
					this.runtime.execBrick(
						cardPack.initializer,
						this.createContext(obj, {
							vars: { cardNumber: i },
						})
					);
				}
				let cardType = this.content.cardTypes[cardPack.cardType];
				if (cardType.action_on_create) {
					this.runtime.execBrick(cardType.action_on_create, this.createContext(obj));
				}
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
		if (this.attrs[attr] === undefined) throw new Error('Error trying to set unknown attr ' + attr);
		this.attrs[attr] = value;
		this.onGameAttrChanged(attr, value);
	}

	createEntity(tplId) {
		let id = Object.values(this.objects).length + 1;
		let entity = new Entity(id, tplId, this);
		this.objects[id] = entity;
		return entity;
	}

	createContext(object, extra = {}) {
		extra.game = this;
		return this.runtime.context(object, extra);
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
		let packedDiff = {
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
		this.diffLog.push(packedDiff);
		this.diff = undefined;
	}

	animate(duration) {
		this.closeDiff();
		this.diffLog.push({
			delay: duration,
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
			this.attrs[attr.code] = 0;
		}
	}

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error(`trying to set unknown attr [${attr}]`);
		this.attrs[attr] = value;
		this.game.onEntityAttrChanged(this, attr, value);
	}
}
