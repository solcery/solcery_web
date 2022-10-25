import { BrickRuntime } from '../content/brickLib/runtime';
import { getTable } from '../utils';
import { UnityPackage } from './unityPackage';

export class Game {
	playerContent = {};

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

	modifyUnityContent() {
		let currentPlayer = this.players.find(player => player.id === this.playerId);
		if (!currentPlayer) return;;
		let contentPlayers = getTable(this.content.unity, 'players', 'objects');
		if (!contentPlayers) return;
		let currentPlayerObject = contentPlayers.find(player => player.index === currentPlayer.index);
		if (!currentPlayerObject) return;
		let modifierIds = currentPlayerObject.modifiers;
		if (!modifierIds) return;
		for (let modifierId of modifierIds) {
			let modifier = this.content.unity.modifiers.objects.find(mod => mod.id === modifierId);
			let places = modifier.places;
			if (!places) continue;
			for (let { original, override } of places) {
				let originPlace = this.content.unity.places.objects.find(place => place.id === original);
				let overridePlace = this.content.unity.places.objects.find(place => place.id === override);
				for (let prop of Object.keys(overridePlace)) {
					if (prop === 'id') continue;
					originPlace[prop] = overridePlace[prop];
				}
			}
		}
	}

	constructor(data) {
		this.id = data.id;
		this.version = data.version; // Unused
		this.players = data.players;
		this.playerId = data.playerId; // Current player info
		this.content = JSON.parse(JSON.stringify(data.content));
		this.nfts = data.nfts ?? [];
		this.unityBuild = data.unityBuild;
		this.onError = data.onError;
		this.modifiers = data.modifiers;
		this.onAction = data.onAction;
		this.onPlayerAction = (action) => {
			if (!this.onAction) {
				this.applyAction({
					player: this.playerId,
					action,
				});
				if (this.onLogUpdate) {
					this.onLogUpdate(this.actionLog);
				}
			} else {
				this.onAction(action);
			}
		}
		this.gameState = new GameState({
			seed: data.seed,
			content: data.content,
		})
		this.layoutOverride = data.layoutOverride;
		this.modifyUnityContent();
		this.actionLog = [];
		if (data.actionLog) {
			for (let action of data.actionLog) {
				this.applyAction(action);
			}
		}
	}

	applyAction(action) {
		const playerId = action.playerId;
		let player = this.players.find(player => player.id === playerId);
		if (player) {
			var player_index = player.index;
		}
		let { type, data } = action.action;
		this.gameState.newPackage();
		switch (type) {
			case 'init':
				this.gameState.start(this.layoutOverride, this.nfts);
				break;
			case 'leftClick':
				this.gameState.objectEvent(data.objectId, 'action_on_left_click', { player_index });
				break;
			case 'rightClick':
				this.gameState.objectEvent(data.objectId, 'action_on_right_click', { player_index });
				break;
			case 'dragndrop':
				this.gameState.dragndrop(data.objectId, data.dragndropId, data.targetPlaceId, { player_index });
				break;
			default: 
				throw ('ERR');
		}
		let pkg = this.gameState.exportPackage();
		this.actionLog.push({
			action, 
			package: pkg,
		})
	}

	updateLog(log) {
		if (log.length > this.actionLog.length);
		let toAdd = log.slice(this.actionLog.length);
		for (let entry of toAdd) {
			this.applyAction(entry);
		};
		if (this.onLogUpdate) {
			this.onLogUpdate(this.actionLog);
		}
	}

	onClientCommand = (command) => {
		let action = {};
		switch (command.command_data_type) {
			case 0: // Left click
				action.type ='leftClick';
				action.data = {
					objectId: command.object_id,
				};
				break;
			case 1:
				action.type ='rightClick';
				action.data = {
					objectId: command.object_id,
				};
				break;
			case 2:
				action.type ='dragndrop';
				action.data = {
					objectId: command.object_id,
					targetPlaceId: command.target_place_id,
					dragndropId: command.drag_drop_id,
				};
				break;
			default:
				throw 'Unkown client action: ', action;

		}
		this.onPlayerAction(action);
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
		let outcome = this.gameState.checkOutcome();
		if (outcome) {
			this.outcome = outcome;
			this.finished = true;
		}
	}
}

export class GameState {
	objects = {};
	attrs = {};
	diff = undefined;
	diffLog = undefined;

	constructor(data) {
		this.seed = data.seed ?? 0;
		this.content = data.content.web;
		this.runtime = new BrickRuntime(this.content, data.seed);
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

	objectEvent = (objectId, event, vars) => {
		let object = this.objects[objectId];
		if (!object) throw new Error('Attempt to call event unkown object!');
		let ctx = this.createContext(object, { vars });
		let cardType = this.content.cardTypes[object.tplId];
		if (cardType[event]) {
			this.runtime.execBrick(cardType[event], ctx);
		}
	};

	dragndrop = (objectId, dragAndDropId, targetPlace) => {
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

	constructor(id, tplId, gameState) {
		this.id = id;
		this.tplId = tplId;
		this.attrs = {};
		this.gameState = gameState;
		for (let attr of Object.values(gameState.content.attributes)) {
			this.attrs[attr.code] = 0;
		}
	}

	setAttr(attr, value) {
		if (this.attrs[attr] === undefined) throw new Error(`trying to set unknown entity attr [${attr}]`);
		this.attrs[attr] = value;
		this.gameState.pushPackageEvent('onEntityAttrChanged', this, attr, value);
	}

	transform(tplId) {
		this.tplId = tplId;
		this.gameState.pushPackageEvent('onEntityTransform', this, tplId);
	}
}



