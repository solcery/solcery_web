import { diff } from 'deep-object-diff';
import { BrickRuntime } from 'solcery_brick_runtime';
import GameState from 'solcery_game_state';

const objectToArray = (obj) => {
	return Object.entries(obj).map(([key, value]) => {
		return { key, value };
	});
};

const STATE_TYPES = {
	state: 0,
	delay: 1,
	timer: 2,
};

const ACTION_TYPES = {
	NONE: 0,
	SOUND: 1,
	ANIMATION: 2,
};


const toUnityFormat = (state) => {
	let value = {
		attrs: [],
		objects: [],
		deleted_objects: [],
	};
	if (state.attrs) {
		value.attrs = objectToArray(state.attrs);
	}
	if (state.entities) {
		for (let [ id, entity ] of Object.entries(state.entities)) {
			if (entity === undefined) {
				value.deleted_objects.push(id);
			} else {
				value.objects.push({
					id: parseInt(id),
					tplId: entity.tplId,
					attrs: objectToArray(entity.attrs),
				})
			}
		}
	}
	return {
		state_type: STATE_TYPES.state,
		value,
	};
}


export class UnityPackage {
	actions = [];
	states = [];

	constructor(data) {
		this.lastState = data.state; // initial saved state
		this.content = data.content;
		this.action = data.action;
	}

	pause(duration) {
		let currentState = this.gameState.save();
		let stateDiff = diff(currentState, this.lastState);
		console.log('PAUSE', duration)
		if (stateDiff.attrs || stateDiff.entities) {
			let unityState = toUnityFormat(stateDiff);
			this.pushState(unityState)
		}
		this.pushState({
			state_type: STATE_TYPES.delay,
			value: {
				delay: duration,
			},
		})
		this.lastState = currentState;
	}

	pushAction(actionType, ctx) {
		this.actions.push({
			state_id: this.states.length,
			action_type: actionType,
			value: ctx
		})
	}

	pushState(state) {
		state.id = this.states.length;
		this.states.push(state);
	}

	compute() {
		this.gameState = new GameState({
			seed: 0,
			content: this.content,
			brickRuntimeBindings: {
				client: {
					pause: (duration) => this.pause(duration),
					pushAction: (...args) => this.pushAction(...args),
				}
			},
			state: this.lastState,
		})
		if (this.action.type === 'init') { //TODO: remove
			this.gameState.applyAction(this.action);
			let state = toUnityFormat(this.gameState.save());
			return {
				actions: [],
				states: [ state ],
			}
		}
		this.pushState(toUnityFormat(this.lastState));
		this.gameState.applyAction(this.action);
		let finalState = this.gameState.save();
		this.pushState(toUnityFormat(diff(this.lastState, finalState)));
		return {
			// actions: this.actions,
			actions: [],
			states: this.states,
		}
	}
}


// class UnityPackageState {
// 	actions = [];

// 	atts = {};
// 	entities = {};


// 	export() {
// 		let attrs = objectToArray(this.atts);
// 		let objects = Object.values(this.entities).map(entity => ({
// 			id: entity.id,
// 			tplId: entity.tplId,
// 			attrs: objectToArray(entity.attrs),	
// 		}));
// 		let state = {
// 			state_type: STATE_TYPES.state,
// 			value: {
// 				attrs,
// 				objects,
// 			},
// 		};
// 		let actions = this.actions;
// 		return { state, actions };
// 	}

// 	onEntityAttrChanged(entity, attr, value) {
// 		if (!this.entities[entity.id]) {
// 			this.entities[entity.id] = {
// 				id: entity.id,
// 				tplId: entity.tplId,
// 				attrs: {},
// 			};
// 		}
// 		this.entities[entity.id].attrs[attr] = value;
// 	}

// 	onEntityCreated(entity) {
// 		this.entities[entity.id] = {
// 			id: entity.id,
// 			tplId: entity.tplId,
// 			attrs: Object.assign({}, entity.attrs),
// 		};
// 	}

// 	onEntityTransform(entity) {
// 		if (!this.entities[entity.id]) {
// 			this.entities[entity.id] = {
// 				id: entity.id,
// 				tplId: entity.tplId,
// 				attrs: {},
// 			};
// 		}
// 		this.entities[entity.id].tplId = entity.tplId;
// 	}

// 	onGameAttrChanged(attr, value) {
// 		this.attrs[attr] = value;
// 	}

// 	onPlaySound(sound_id, volume) {
// 		this.actions.push({
// 			action_type: ACTION_TYPES.SOUND, // Тип экшена
// 			value: {
// 				sound_id,
// 				volume,
// 			}
// 		});
// 	}

// 	onAction(actionType, ctx) {
// 		this.actions.push({
// 			action_type: actionType,
// 			value: ctx
// 		})
// 	}
// }

// export class UnityPackage { 
// 	actions = [];
// 	states = [];
// 	exported = false;

// 	constructor(game) {
// 		this.newCurrent()
// 		if (!game) return;
// 		for (let [ attr, value ] of Object.entries(game.attrs)) {
// 			this.current.onGameAttrChanged(attr, value);
// 		}
// 		for (let object of Object.values(game.objects)) {
// 			for (let [ attr, value ] of Object.entries(object.attrs)) {
// 				this.current.onEntityAttrChanged(object, attr, value);
// 			}
// 		}
// 	}	

// 	newCurrent() {
// 		this.current = new UnityPackageState();
// 	}

// 	export() {
// 		if (this.current) this.pushCurrent();
// 		return {
// 			actions: this.actions,
// 			states: this.states,
// 		}
// 	}

// 	addState(state, actions) {
// 		let id = this.states.length;
// 		state.id = id;
// 		this.states.push(state);
// 		if (!actions) return;
// 		for (let action of actions) {
// 			action.state_id = id;
// 			this.actions.push(action);
// 		}
// 	}

// 	pushCurrent() {
// 		if (!this.current) return;
// 		let { state, actions } = this.current.export();
// 		this.addState(state, actions);
// 		this.current = undefined;
// 	}


// 	onPause(duration) {
// 		this.pushCurrent();
// 		this.addState({
// 			state_type: STATE_TYPES.delay,
// 			value: {
// 				delay: duration,
// 			},
// 		});
// 	}

// 	onStartTimer(object, duration) {
// 		this.addState({
// 			state_type: STATE_TYPES.timer,
// 			value: {
// 				object_id: object.id,
// 				start: true,
// 				duration,
// 			},
// 		});
// 	}

// 	onStopTimer(object) {
// 		this.states.push({
// 			state_type: STATE_TYPES.timer,
// 			value: {
// 				object_id: object.id,
// 				start: false,
// 			},
// 		});
// 	}


// 	onEntityAttrChanged(entity, attr, value) {
// 		if (!this.current) this.newCurrent();
// 		this.current.onEntityAttrChanged(entity, attr, value);
// 	}

// 	onEntityCreated(entity) {
// 		if (!this.current) this.newCurrent();
// 		this.current.onEntityCreated(entity);
// 	}

// 	onEntityTransform(entity) {
// 		if (!this.current) this.newCurrent();
// 		this.current.onEntityTransform(entity);
// 	}

// 	onGameAttrChanged(attr, value) {
// 		if (!this.current) this.newCurrent();
// 		this.current.onGameAttrChanged(attr, value);
// 	}

// 	onPlaySound(soundId, volume) {
// 		if (!this.current) this.newCurrent();
// 		this.current.onPlaySound(soundId, volume);
// 	}

// 	onAction(actionType, ctx) {
// 		if (!this.current) this.newCurrent();
// 		this.current.onAction(actionType, ctx);
// 	}

// }