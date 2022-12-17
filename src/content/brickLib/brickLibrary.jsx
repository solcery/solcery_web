import { insertTable } from '../../utils';
import { contexts } from 'solcery_brick_runtime';
import { SType } from '../types';

export const paramFromMapEntry = (entry) => {
	let value = entry.value;
	let type;
	if (value === 'condition' || value === 'action' || value === 'value' || value === 'jsonToken') {
		type = SType.from(`SBrick<${value}>`);
	} else {
		type = SType.from(value);
	}
	return {
		code: entry.key,
		name: entry.key,
		type,
	};
};


export class BrickLibrary {
	bricks = {};
	brickTypes = {};

	addBrick(brickSignature) {
		let brick = Object.assign({}, brickSignature);
		brick.params = brickSignature.params.map((param) => {
			let newParam = Object.assign({}, param);
			if (typeof newParam.type === 'string') {
				newParam.type = SType.from(newParam.type);
			} else if (typeof newParam.type === 'object') {
				if (newParam.type.data && newParam.type.name) {
					newParam.type = SType.from(newParam.type);
				}
			}
			return newParam;
		});
		insertTable(this.bricks, brick, brick.lib, brick.func);
	}

	constructor(content) {
		for (let [ contextName, context ] of Object.entries(contexts)) {
			for (let [ lib, funcs ] of Object.entries(context.bricks)) {
				for (let [ func, brick ] of Object.entries(funcs)) {
					brick.lib = lib;
					brick.func = func;
					this.addBrick(brick)
				}
			}
		}
		if (!content || !content.objects) return;
		let customBricksObjects = content.objects
			.filter((obj) => obj.template === 'customBricks')
			.filter((obj) => obj.fields.enabled)
			.filter((obj) => obj.fields.brick && obj.fields.brick.brickTree);
		for (let obj of customBricksObjects) {
			let params = [];
			if (obj.fields.brick.brickParams) {
				params = obj.fields.brick.brickParams.map((entry) => paramFromMapEntry(entry));
			}
			let brick = {
				name: obj.fields.name,
				params,
				lib: obj.fields.brick.brickTree.lib,
				func: `custom.${obj._id}`,
			}
			if (obj.fields.hidden) {
				brick.hidden = true;
			}
			this.addBrick(brick)
		}
	}
}
