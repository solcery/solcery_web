import { BrickRuntime } from '../content/brickLib/runtime';
import { getTable } from '../utils';
import { UnityPackage } from './unityPackage';
import Bot from './bot';

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

	modifyUnityContent() {
		let currentPlayer = this.players.find(player => player.index === this.playerIndex);
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
		this.playerIndex = data.playerIndex; // Current player info
		this.content = JSON.parse(JSON.stringify(data.content));
		this.unityBuild = data.unityBuild;
		this.onError = data.onError;
		this.modifiers = data.modifiers;
		this.started = data.started;
		this.onAction = data.onAction;
		this.onLogUpdate = [];
		this.gameState = new GameState({
			seed: data.seed,
			content: data.content,
			players: data.players,
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

	setBotStatus(enable) {
		if (!enable) {
			delete this.bot;
			return;
		}
		this.bot = new Bot({
			gameBuild: {
				content: this.content
			},
			gameState: this.gameState,
			playerIndex: this.playerIndex,
			onCommand: (action) => this.onAction(action),
		})
		this.bot.think();
	}

	applyAction(action) {
		let { type, commandId, ctx, playerIndex, time } = action;
		this.gameState.time = time;
		this.gameState.newPackage();
		switch (type) {
			case 'init':
				this.gameState.start(this.layoutOverride);
				break;
			case 'gameCommand':
				this.gameState.applyCommand(commandId, ctx)
				break;
			default: 
				break;
		}
		let pkg = this.gameState.exportPackage();
		this.actionLog.push({
			action, 
			package: pkg,
		})
	}

	updateLog(log) {
		if (log.length <= this.actionLog.length) return;
		let toAdd = log.slice(this.actionLog.length);
		for (let entry of toAdd) {
			this.applyAction(entry);
		};
		for (let logUpdateCallback of this.onLogUpdate) {
			logUpdateCallback(this.actionLog);
		}
		if (this.bot) {
			this.bot.think(); //TODO: move somewhere
		}
	}

	onPlayerCommand = (commandId, ctx) => {
		if (!this.onAction) return;
		let action = {
			type: 'gameCommand',
			commandId,
			ctx,
		}
		this.onAction(action);
	}

	getUnityContent = () => this.content.unity;

	getContentOverrides = () => {
		// TODO: do not override without nfts
		let nfts = [];
		for (let player of this.players) {
			if (!player.nfts) continue;
			for (let nft of player.nfts) {
				nfts.push({
					id: nft.entityId,
					data: {
						displayed_name: nft.name,
						picture: nft.image,
					},
				});
			}
		}
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

	getCommands = () => {
		return this.actionLog.filter(entry => entry.action.type === 'gameCommand').map((entry, index) => ({
			id: index + 1,
			data: {
				type: 'gameCommand',
				command_id: entry.action.commandId,
				ctx: entry.action.ctx,
			}
		}));
	}
}

export class GameState {
	objects = {};
	attrs = {};
	diff = undefined;
	diffLog = undefined;
	maxEntityId = 0;


	constructor(data) {
		this.seed = data.seed;
		this.content = data.content.web;
		this.players = data.players;
		this.runtime = new BrickRuntime(this.content, data.seed);
		this.miscRuntime = new BrickRuntime(this.content, data.seed);
		for (let attr of Object.values(this.content.gameAttributes)) {
			this.attrs[attr.code] = 0;
		}
	}
	
	getRuntime(type = 'misc') {
		if (type === 'misc') {
			return this.miscRuntime;
		}
		if (type === 'main') {
			return this.runtime;
		}
	}

	getResult() {
		let gameOverCondition = this.content.gameSettings.gameOverCondition;
		if (!gameOverCondition) return;
		let ctx = this.createContext();
		let finished = this.runtime.execBrick(gameOverCondition, ctx);
		if (!finished) return;
		if (!this.content.players) return {};
		let playerScore = {};
		for (let player of this.players) {
			let playerInfo = Object.values(this.content.players).find(p => p.index === player.index);
			let scoreValue = playerInfo.score;
			if (!scoreValue) {
				playerScore[playerInfo.index] = 0;
				continue;
			}
			let ctx = this.createContext();
			let score = this.runtime.execBrick(scoreValue, ctx);
			playerScore[playerInfo.index] = score;
		}
		return {
			playerScore,
		};
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

	start = () => {
		let layout = this.content.gameSettings.layout;
		if (!layout) throw new Error('Error: Empty game layout');
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
		if (this.content.collections) {
			for (let player of this.players) {
				if (!player.nfts) continue;
				for (let nft of player.nfts) {
					let collection = Object.values(this.content.collections)
						.find(obj => obj.collection === nft.collection);
					if (!collection) continue;
					let playerInfo = Object.values(this.content.players).find(p => p.index === player.index);
					let entity = this.createEntity(collection.cardType, playerInfo.nftPlace, collection.initAction);
					nft.entityId = entity.id;
				}
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

	applyCommand = (commandId, scopeVars) => {
		let command = this.content.commands[commandId];
		if (!command) throw 'No such game command';
		let ctx = this.createContext();
		if (scopeVars) Object.assign(ctx.scopes[0].vars, scopeVars);
		if (command.action) {
			this.runtime.execBrick(command.action, ctx);
		}
		for (let objectId of Object.keys(this.objects)) {
			if (this.objects[objectId].deleted) {
				delete this.objects[objectId];
			}
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
		let id = this.maxEntityId + 1;
		let entity = new Entity(id, cardTypeId, this);
		if (this.objects[id]) throw new Error(`Game.createEntity error: Object Id '${id}' is already taken!`);
		this.maxEntityId = id;
		this.objects[id] = entity;
		if (!place) throw new Error('Game.createEntity error: No place given for created entity!');
		entity.attrs.place = place;
		let cardType = this.content.cardTypes[cardTypeId];
		if (!cardType) throw new Error('Game.createEntity error: Unknown cardType!');
		this.pushPackageEvent('onEntityCreated', entity);
		if (cardType.action_on_create) {
			this.runtime.execBrick(cardType.action_on_create, this.createContext(entity, ctx));
		}
		if (initAction) {
			this.runtime.execBrick(initAction, this.createContext(entity, ctx));
		}
		return entity;
	}

	deleteEntity(entity) {
		entity.setAttr('place', 0);
		entity.deleted = true;
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
		this.pushPackageEvent('onPlaySound', soundId, volume);
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



