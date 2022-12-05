import { BrickRuntime } from 'solcery_brick_runtime';
import GameState from 'solcery_game_state';
import { getTable } from '../utils';
import { UnityPackage } from './unityPackage';
import Bot from './bot';

export class Game { // TODO: Match
	log = [];

	constructor(data) {
		this.id = data.id;
		this.players = data.players;
		this.playerIndex = data.playerIndex; // Current player info
		this.content = JSON.parse(JSON.stringify(data.content));
		this.unityBuild = data.unityBuild;
		this.onAction = data.onAction;
		this.gameState = new GameState({
			seed: data.seed,
			content: data.content.web,
		})
		this.prepareUnityContent();
		this.log = [];
		if (data.actionLog) {
			this.updateLog(data.actionLog)
		}
	}

	prepareUnityContent() {
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

	getUnityPackage(step) { // TODO: move to client
		let logEntry = this.log[step];
		if (!logEntry) return;
		let { action, state } = logEntry;
		let unityPackage = new UnityPackage({
			state,
			action,
			content: this.content.web,
		})
		return unityPackage.compute();
	}

	setBotStatus(enable) {
		return; // TODO:
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
		this.log.push({
			action,
			state: this.gameState.save()
		})
		this.gameState.applyAction(action)
	}

	updateLog(log) {
		if (log.length <= this.log.length) return;
		let toAdd = log.slice(this.log.length);
		for (let entry of toAdd) {
			this.applyAction(entry);
		};
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

	getCommands = () => this.actionLog
		.filter(entry => entry.action.type === 'gameCommand')
		.map((entry, index) => ({
			id: index + 1,
			data: {
				type: 'gameCommand',
				command_id: entry.action.commandId,
				ctx: entry.action.ctx,
			}
		}));
}

