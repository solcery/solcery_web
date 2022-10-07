import { BrickRuntime } from '../content/brickLib';
import { notify } from '../components/notification';
import { getTable } from '../utils';

const STATE_TYPES = {
	state: 0,
	delay: 1,
	timer: 2,
};

const ACTION_TYPES = {
	NONE: 0,
	SOUND: 1,
};

const objectToArray = (obj) => {
	return Object.entries(obj).map(([key, value]) => {
		return { key, value };
	});
};

export class Session {
	
	error(err) {
		if (this.onError) {
			err.data = {
				type: 'runtime'
			}
			this.onError(err, this.id);
		} else {
			console.error(err);
		}
	}

	start() {
		if (this.started) return;
		if (this.game) {
			delete this.game;
			this.game = new Game(this);
		}
		try {
			this.game.start(this.layout, this.nfts);
			for (let command of this.log) {
				this.applyCommand(command)
			}
		}
		catch (err) {
			this.error(err)
		}
		this.started = true;
	}

	constructor(data) {
		this.id = data.id;
		this.content = data.content;
		this.seed = data.seed ?? 0;
		this.game = new Game(this);
		this.players = data.players;
		this.log = data.log ?? [];
		this.runtime = new BrickRuntime(data.content.web, this.seed);
		this.layout = data.layout;
		this.nfts = data.nfts ?? [];
		this.gameApi = data.gameApi;
		this.onError = data.onError;
	}

	getUnityContent = () => this.content.unity;

	getContentOverrides = () => {
		// TODO: do not override without nfts
		let nfts = this.nfts.map(nft => ({
			id: nft.entityId,
			data: {
				displayed_name: nft.name,
				picture: nft.image,
			},
		}))
		let card_types = Object.values(this.content.web.cardTypes)
			.filter(cardType => cardType.nftOverrides)
			.map(cardType => {
				let fields = [];
				let overrides = cardType.nftOverrides;
				if (overrides.overrideName) fields.push('displayed_name');
				if (overrides.overrideImage) fields.push('picture');
				return {
					id: cardType.id,
					override_fields: fields,
				}
			})
		return { nfts, card_types };
	}

	checkOutcome = () => {
		let outcome = this.game.checkOutcome();
		if (outcome) {
			this.outcome = outcome;
			this.finished = true;
		}
	}

	// applying command to log
	applyCommand = (command) => {
		if (this.finished) return;
		this.game.newPackage();
		if (command.command_data_type === 0) {
			this.game.objectEvent(command.object_id, 'action_on_left_click');
		}
		if (command.command_data_type === 1) {
			this.game.objectEvent(command.object_id, 'action_on_right_click');
		}
		if (command.command_data_type === 2) {
			this.game.dropCard(command.object_id, command.drag_drop_id, command.target_place_id);
		}
		this.checkOutcome();
		return this.game.exportPackage();
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
		try {
			return this.applyCommand(command);
		} catch (err) {
			this.error(err)
		}
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

	checkOutcome() {
		let outcomeValue = getTable(this.content, 'gameSettings', 'outcome');
		if (!outcomeValue) return;
		let ctx = this.createContext();
		let outcome = this.runtime.execBrick(outcomeValue, ctx);
		if (outcome === 0) return;
		return outcome;
	}

	newPackage() {
		this.unityPackage = new UnityPackage(this);
	}

	exportPackage() {
		if (!this.unityPackage) this.newPackage(this);
		return this.unityPackage.export();
	}

	pushPackageEvent(event, ...args) {
		if (!this.unityPackage) return;
		this.unityPackage[event](...args);
	}

	start = (layoutOverride, nfts) => {
		let layout = layoutOverride ?? this.content.gameSettings.layout;
		if (!layout) throw new Error('Error: Trying to initLayout without preset scheme');
		for (let cardPack of Object.values(this.content.cards)) {
			if (!layout.includes(cardPack.preset)) continue;
			for (let i = 0; i < cardPack.amount; i++) {
				this.createEntity(cardPack.cardType, cardPack.place, cardPack.initializer);
			}
			if (cardPack.cards) {
				for (let { cardType, amount } of cardPack.cards) {
					for (let j = 0; j < amount; j++) {
						this.createEntity(cardType, cardPack.place, cardPack.initializer);
					}
				}
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
		if (this.content.gameSettings.initAction) {
			let ctx = this.createContext();
			this.runtime.execBrick(this.content.gameSettings.initAction, ctx)
		}
	};

	objectEvent = (objectId, event) => {
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to call event unkown object!');
		let ctx = this.createContext(object);
		let cardType = this.content.cardTypes[object.tplId];
		if (cardType[event]) {
			this.runtime.execBrick(cardType[event], ctx);
		}
	};

	dropCard = (objectId, dragAndDropId, targetPlace) => {
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to call drop for unkown object!');
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
		this.pushPackageEvent('onGameAttrChanged', attr, value);
	}

	createEntity(cardTypeId, place, initAction, ctx) {
		let id = Object.values(this.objects).length + 1;
		let entity = new Entity(id, cardTypeId, this);
		this.objects[id] = entity;
		if (!place) throw new Error('Game.createEntity error: No place given for created entity!');
		entity.attrs.place = place;
		let cardType = this.content.cardTypes[cardTypeId];
		if (!cardType) throw new Error('Game.createEntity error: Unknown cardType!');
		if (cardType.action_on_create) {
			this.runtime.execBrick(cardType.action_on_create, this.createContext(entity, ctx));
		}
		if (initAction) {
			this.runtime.execBrick(initAction, this.createContext(entity, ctx));
		}
		this.pushPackageEvent('onEntityCreated', entity);
		return entity;
	}

	createContext(object, extra = {}) {
		extra.game = this;
		return this.runtime.context(object, extra);
	}

	pause(duration) {
		this.pushPackageEvent('onPause', duration);
	}

	startTimer(object, duration) {
		this.pushPackageEvent('onStartTimer', object, duration);
	}

	stopTimer(object) {
		this.pushPackageEvent('onStopTimer', object);
	}
	
	playSound(soundId, volume) {
		this.pushPackageEvent('onPlaySound', soundId);
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
		if (this.attrs[attr] === undefined) throw new Error(`trying to set unknown entity attr [${attr}]`);
		this.attrs[attr] = value;
		this.game.pushPackageEvent('onEntityAttrChanged', this, attr, value);
	}

	transform(tplId) {
		this.tplId = tplId;
		this.game.pushPackageEvent('onEntityTransform', this, tplId);
	}
}

class UnityPackageState {
	actions = [];

	gameAttrs = {};
	entities = {};

	export() {
		let attrs = objectToArray(this.gameAttrs);
		let objects = Object.values(this.entities).map(entity => ({
			id: entity.id,
			tplId: entity.tplId,
			attrs: objectToArray(entity.attrs),	
		}));
		let state = {
			state_type: STATE_TYPES.state,
			value: {
				attrs,
				objects,
			},
		};
		let actions = this.actions;
		return { state, actions };
	}

	onEntityAttrChanged(entity, attr, value) {
		if (!this.entities[entity.id]) {
			this.entities[entity.id] = {
				id: entity.id,
				tplId: entity.tplId,
				attrs: {},
			};
		}
		this.entities[entity.id].attrs[attr] = value;
	}

	onEntityCreated(entity) {
		this.entities[entity.id] = {
			id: entity.id,
			tplId: entity.tplId,
			attrs: Object.assign({}, entity.attrs),
		};
	}

	onEntityTransform(entity) {
		if (!this.entities[entity.id]) {
			this.entities[entity.id] = {
				id: entity.id,
				tplId: entity.tplId,
				attrs: {},
			};
		}
		this.entities[entity.id].tplId = entity.tplId;
	}

	onGameAttrChanged(attr, value) {
		this.gameAttrs[attr] = value;
	}

	onPlaySound(soundId) {
		this.actions.push({
			action_type: ACTION_TYPES.SOUND, // Тип экшена
			value: {
				sound_id: soundId 
			}
		});
	}
}

class UnityPackage { 
	actions = [];
	states = [];
	exported = false;

	constructor(game) {
		this.newCurrent()
		if (!game) return;
		for (let [ attr, value ] of Object.entries(game.attrs)) {
			this.current.onGameAttrChanged(attr, value);
		}
		for (let object of Object.values(game.objects)) {
			for (let [ attr, value ] of Object.entries(object.attrs)) {
				this.current.onEntityAttrChanged(object, attr, value);
			}
		}
	}	

	newCurrent() {
		this.current = new UnityPackageState();
	}

	export() {
		if (this.current) this.pushCurrent();
		return {
			actions: this.actions,
			states: this.states,
		}
	}

	addState(state, actions) {
		let id = this.states.length;
		state.id = id;
		this.states.push(state);
		if (!actions) return;
		for (let action of actions) {
			action.state_id = id;
			this.actions.push(action);
		}
	}

	pushCurrent() {
		if (!this.current) return;
		let { state, actions } = this.current.export();
		this.addState(state, actions);
		this.current = undefined;
	}


	onPause(duration) {
		this.pushCurrent();
		this.addState({
			state_type: STATE_TYPES.delay,
			value: {
				delay: duration,
			},
		});
	}

	onStartTimer(object, duration) {
		this.addState({
			state_type: STATE_TYPES.timer,
			value: {
				object_id: object.id,
				start: true,
				duration,
			},
		});
	}

	onStopTimer(object) {
		this.states.push({
			state_type: STATE_TYPES.timer,
			value: {
				object_id: object.id,
				start: false,
			},
		});
	}


	onEntityAttrChanged(entity, attr, value) {
		if (!this.current) this.newCurrent();
		this.current.onEntityAttrChanged(entity, attr, value);
	}

	onEntityCreated(entity) {
		if (!this.current) this.newCurrent();
		this.current.onEntityCreated(entity);
	}

	onEntityTransform(entity) {
		if (!this.current) this.newCurrent();
		this.current.onEntityTransform(entity);
	}

	onGameAttrChanged(attr, value) {
		if (!this.current) this.newCurrent();
		this.current.onGameAttrChanged(attr, value);
	}

	onPlaySound(soundId) {
		if (!this.current) this.newCurrent();
		this.current.onPlaySound(soundId);
	}

}

