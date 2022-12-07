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
	console.log(state)
	if (state.attrs) {
		value.attrs = objectToArray(state.attrs);
	}
	if (state.entities) {
		for (let [ entityId, entity ] of Object.entries(state.entities)) {
			if (entity === undefined) {
				value.deleted_objects.push(entityId);
			} else {
				let object = {
					id: parseInt(entityId),
					tplId: entity.tplId,
					attrs: [],
				}
				if (entity.attrs) {
					object.attrs = objectToArray(entity.attrs);
				}
				value.objects.push(object)
			}
		}
	}
	return {
		state_type: STATE_TYPES.state,
		value,
	};
}

const stateDiff = (oldState, newState) => {
	let res = diff(oldState, newState);
	if (!res.attrs && !res.entities) return;
	if (res.entities) {
		for (let [ entityId, entity ] of Object.entries(res.entities)) {
			if (!entity) continue;
			// let newEntity = newState.entities[entityId];
			entity.tplId = newState.entities[entityId].tplId;
		}
	}
	return res
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
		let diffState = stateDiff(this.lastState, currentState);
		if (diffState) {
			let unityState = toUnityFormat(diffState, this.gameState);
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
		let lastDiff = stateDiff(this.lastState, finalState);
		if (lastDiff) {
			this.pushState(toUnityFormat(lastDiff));
		}
		return {
			actions: this.actions,
			states: this.states,
		}
	}
}
