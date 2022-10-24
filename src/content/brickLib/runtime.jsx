import { insertTable } from '../../utils';

export const generic = {
	arg: (runtime, params, ctx) => {
		var scope = ctx.scopes.pop();
		var result = runtime.execBrick(scope.args[params.name], ctx);
		ctx.scopes.push(scope);
		return result;
	}
};

class Random {
	constructor(seed) {
		this._seed = seed % 2147483647;
		if (this._seed <= 0) this._seed += 2147483646;
	}

	range(min, max) {
		this._seed = this._seed * 16807 % 2147483647;
		return min + this._seed % (max - min);
	}
}

export class BrickRuntime {
	bricks = {};
	constructor(content, seed = 0) {
		const { basicActions } = require('./action');
		const { basicConditions } = require('./condition');
		const { basicValues } = require('./value');
		basicActions.forEach((brick) => insertTable(this.bricks, brick, brick.lib, brick.func));
		basicConditions.forEach((brick) => insertTable(this.bricks, brick, brick.lib, brick.func));
		basicValues.forEach((brick) => insertTable(this.bricks, brick, brick.lib, brick.func));
		if (!content) return;
		for (let obj of Object.values(content.customBricks)) {
			// TODO: wrong
			let lib = obj.brick.lib;
			let func = `custom.${obj.id}`;
			let brick = {
				lib,
				func,
				exec: (runtime, params, ctx) => {
					ctx.scopes.push(this.newScope(params));
					let result = this.execBrick(obj.brick, ctx);
					ctx.scopes.pop();
					return result;
				},
			};
			insertTable(this.bricks, brick, lib, func);
		}
		this.random = new Random(seed)
	}

	newLog(game) {

	}

	newScope (args = {}) {
		return { args, vars: {} }
	}

	shuffle(array) {
		for (var i = array.length - 1; i > 0; i--) {
			var j = this.random.range(0, i);
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	}

	context = (object, extra) => {
		var ctx = Object.assign(
			{
				scopes: [],
				vars: {},
			},
			extra
		);
		ctx.object = object;
		return ctx;
	};

	execBrick = (brick, ctx) => {
		let func = this.bricks[brick.lib][brick.func].exec;
		return func(this, brick.params, ctx);
	};
}
