import { insertTable } from 'utils';
import { contexts } from 'solcery_brick_runtime';
import { SType } from '../types';

const brickTypes = [
	{
		code: 'action',
		name: 'Action',
		color: '#6D8BAC',
		inverted: true,
		default: 'void',
	},
	{
		code: 'condition',
		name: 'Condition',
		color: '#e8b463',
		default: 'const',
	},
	{
		code: 'value',
		name: 'Value',
		color: '#788C7F',
		default: 'const',
	},
	{
		code: 'jsonKeyPair',
		name: 'JSON KeyPair',
		color: '#6272a4',
		default: 'base',
	},
	{
		code: 'jsonToken',
		name: 'JSON Token',
		color: '#bd93f9',
		default: 'object'
	},
]

export class BrickLibrary {
	bricks = [];

	constructor(src) {
		if (src) {
			for (let brick of src) {
				this.addBrick(brick);
			}
			return;
		}
		for (let [ contextName, context ] of Object.entries(contexts)) {
			for (let [ lib, funcs ] of Object.entries(context.bricks)) {
				for (let [ func, brick ] of Object.entries(funcs)) {
					brick.lib = lib;
					brick.func = func;
					this.addBrick(brick)
				}
			}
		}

	}

	addBrick(brickSignature) {
		if (this.getBrick(brickSignature.lib, brickSignature.func)) return;
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
		this.bricks.push(brick)
	}

	addCustomBricks(content) {
		let customBricksObjects = content.objects
			.filter((obj) => obj.template === 'customBricks')
			.filter((obj) => obj.fields.enabled)
			.filter((obj) => obj.fields.brick && obj.fields.brick.nodes);
		for (let obj of customBricksObjects) {
			let brick = obj.fields.brick;
			let rootNode = brick.nodes.find(node => node.func === 'root');
			if (!rootNode) continue;
			if (brick.params) {
				var params = brick.params.map(({ type, name }) => ({
					name,
					code: name,
					type: SType.from(`SBrick<${type}>`),
				}));
			}
			if (rootNode.lib === 'action') {
				params = params ?? [];
				params.unshift({
					code: '_next',
					name: 'Next',
					type: SType.from('SBrick<action>'),
					optional: true,
				})
			}
			let res = {
				name: obj.fields.name,
				params,
				url: `template/customBricks/${obj._id}/brick`,
				description: obj.fields.description,
				lib: rootNode.lib,
				func: `custom.${obj._id}`,
			}
			if (obj.fields.hidden) {
				res.hidden = true;
			}
			this.addBrick(res)
		}
	}

	getBrick(lib, func) {
		return this.bricks.find(b => b.lib === lib && b.func === func);
	}

	getBricks() {
		return [...this.bricks];
	}

	getType(lib) {
		return brickTypes.find(bt => bt.code === lib);
	}

	getTypeColor(lib) {
		if (!lib || lib === 'error') return 'red';
		let bt = brickTypes.find(bt => bt.code === lib);
		return bt ? bt.color : 'red';
	}

	getTypes() {
		return brickTypes;
	}

	expand(bricks) {
		for (let brick of bricks) {
			this.addBrick(brick);
		}
	}

	new(lib, func, params = {}) {
		let signature = this.getBrick(lib, func);
		let brick = {
			lib: signature.lib,
			func: signature.func,
			params: {},
		}
		for (let param of signature.params) {
			if (params[param.code]) {
				brick.params[param.code] = params[param.code];
				continue;
			}
			if (param.optional || param.noDefault) continue;
			if (param.type.brickType) {
				console.log(param.type.brickType)
				brick.params[param.code] = this.default(param.type.brickType);
			} else {
				brick.params[param.code] = param.type.default();
			}
		}
		return brick;
	}

	default(lib) {
		let type = this.getType(lib);
		let func = type.default;
		if (!func) throw new Error(`No default brick of type ${type}`);
		return this.new(lib, func);
	}

}
