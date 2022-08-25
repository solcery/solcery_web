import { BrickRuntime } from '../content/brickLib';
import { notify } from '../components/notification';

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
		if (this.game) {
			delete this.game;
			this.game = new Game(this);
		}
		this.game.start(this.layout, this.nfts);
		for (let command of this.log) {
			this.applyCommand(command)
		}
		this.game.diffLog = [];
		this.game.startDiff(true);
		this.game.closeDiff();
	}

	constructor(data) {
		this.id = data.id;
		this.content = data.content;
		this.seed = data.seed ?? 0;
		this.game = new Game(this);
		this.players = data.players;
		this.log = data.log ?? [];
		this.runtime = new BrickRuntime(data.content.web, this.seed);
		this.onCommand = data.onCommand;
		this.layout = data.layout;
		this.nfts = data.nfts ?? [];
		this.gameApi = data.gameApi;
	}

	getUnityContent = () => this.content.unity;

	getContentOverrides = () => {
		// TODO: do not override without nfts
		let nfts = this.nfts.map(nft => ({
			id: nft.entityId,
			data: {
				name: nft.name,
				picture: nft.image,
			},
		}))
		let card_types = Object.values(this.content.web.cardTypes)
			.filter(cardType => cardType.nftOverrides)
			.map(cardType => {
				let fields = [];
				let overrides = cardType.nftOverrides;
				if (overrides.overrideName) fields.push('name');
				if (overrides.overrideImage) fields.push('picture');
				return {
					id: cardType.id,
					override_fields: fields,
				}
			})
		return { nfts, card_types };
	}

	// applying command to log
	applyCommand = (command) => {
		this.game.diffLog = [];
		this.game.startDiff(true);
		if (command.command_data_type === 0) {
			this.game.objectEvent(command.object_id, 'action_on_left_click');
		}
		if (command.command_data_type === 1) {
			this.game.objectEvent(command.object_id, 'action_on_right_click');
		}
		if (command.command_data_type === 2) {
			this.game.dropCard(command.object_id, command.drag_drop_id, command.target_place_id);
		}
		this.game.closeDiff();
		return this.game.diffLog;
	}

	onServerCommandFail = (oldLog) => {
		this.log = oldLog;
		this.start();
	}

	onPlayerCommand = async (command) => {
		if (this.gameApi) { // server-based game
			let oldLog = [ ...this.log ];
			this.gameApi.game.action({ gameId: this.id, action: command }).then(
				() => {}, 
				() => this.onServerCommandFail(oldLog)
			);	
		}
		this.log.push(command);
		return this.applyCommand(command);
	};
}

export class Game {
	objects = {};
	attrs = {};
	diff = undefined;
	diffLog = undefined;

	constructor(session) {
		this.session = session;
		this.content = session.content.web;
		this.runtime = new BrickRuntime(this.content, session.seed);
		for (let attr of Object.values(this.content.gameAttributes)) {
			this.attrs[attr.code] = 0;
		}
	}

	start = (layoutOverride, nfts) => {
		let layout = layoutOverride ?? this.content.gameSettings.layout;
		if (!layout) throw new Error('Error: Trying to initLayout without preset scheme');
		for (let cardPack of Object.values(this.content.cards)) {
			if (!layout.includes(cardPack.preset)) continue;
			for (let i = 0; i < cardPack.amount; i++) {
				this.createEntity(cardPack.cardType, cardPack.place, cardPack.initializer);
			}
		}
		if (nfts && this.content.collections) {
			for (let nft of nfts) {
				let collection = Object.values(this.content.collections)
					.find(obj => obj.collection === nft.collection);
				if (!collection) continue;
				let entity = this.createEntity(collection.cardType, collection.place, collection.initAction);
				nft.entityId = entity.id;
			}
		}
	};

	objectEvent = (objectId, event) => {
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to use unexistent object!');
		let ctx = this.createContext(object);
		let cardType = this.content.cardTypes[object.tplId];
		if (cardType[event]) {
			this.runtime.execBrick(cardType[event], ctx);
		}
	};

	dropCard = (objectId, dragAndDropId, targetPlace) => {
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to use unexistent object!');
		let ctx = this.createContext(object, {
			vars: { target_place: targetPlace },
		});
		let dragndrop = this.content.dragNDrops[dragAndDropId];
		if (dragndrop.actionOnDrop) {
			this.runtime.execBrick(dragndrop.actionOnDrop, ctx);
		}
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
			id: this.diffLog.length,
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
