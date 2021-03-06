import { insertTable } from '../../utils';
import { basicActions } from './index';
import { basicValues } from './index';
import { basicConditions } from './index';

export const generic = {
	arg: (runtime, params, ctx) => {
		var args = ctx.args.pop();
		var result = runtime.execBrick(args[params.name], ctx);
		ctx.args.push(args);
		return result;
	},

	shuffle: (array) => {
		for (var i = array.length - 1; i > 0; i--) {
			var j = Math.floor(Math.random() * (i + 1));
			var temp = array[i];
			array[i] = array[j];
			array[j] = temp;
		}
	},
};

export class BrickRuntime {
	bricks = {};
	constructor(content) {
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
					ctx.args.push(params);
					let result = this.execBrick(obj.brick, ctx);
					ctx.args.pop();
					return result;
				},
			};
			insertTable(this.bricks, brick, lib, func);
		}
	}

	context = (object, extra) => {
		var ctx = Object.assign(
			{
				args: [],
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
