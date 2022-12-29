import { ValueRender, FilterRender } from './components';
import unityCodes from './unityCodes';

const validateBrick = (v) => {
	if (v.func === 'error') return false;
	if (v === undefined) return true;
	for (let param of Object.values(v.params)) {
		if (param === null) return false;
		if (param.lib) {
			if (!validateBrick(param)) return false;
		}
	}
	return true;
};

export class SBrick {
	static fromString = (data) => new SBrick({ brickType: data });

	constructor(data) {
		this.brickType = data.brickType;
		this.params = data.params;

		if (!this.brickType) {
			this.filter = {
				eq: (value, filterValue) => {
					return value.brickType === filterValue;
				},
				render: FilterRender,
			};
		}
	}

	validate = (value, meta) => {
		return true; // TODO
		if (value === undefined) return;
		let v = value;
		if (v.brickParams) v = v.brickTree;
		if (!v) return;
		let brickSignature = meta.brickLibrary[v.lib][v.func];
		if (!brickSignature) {
			meta.error(`No brick '${v.lib}.${v.func}'' found in brick library!`);
			return;
		}
		for (let paramSig of brickSignature.params) {
			let param = v.params[paramSig.code];
			if (param === undefined || param === null) {
				// TODO: undefined only
				meta.error(`No param '${paramSig.code}' found for brick '${v.lib}.${v.func}'!`);
			} else if (paramSig.type instanceof SBrick) {
				this.validate(param, meta);
			} else if (paramSig.type.validate) {
				paramSig.type.validate(param, meta);
			}
		}
	};

	validateField = (value) => {
		// client validation before saving
		if (value === undefined) return true;
		let v = value.brickTree;
		if (!v) return true;
		return validateBrick(v);
	};

	construct = (value, meta) => {
		if (!meta.nodes) {
			if (!value) return;
			if (!value.nodes) return;
			meta.nodes = value.nodes;
			let rootNode = value.nodes.find(node => node.func === 'root');
			if (!rootNode) return;
			let res = this.construct(rootNode.params.value, meta);
			meta.nodes = undefined;
			return res;
		}
		if (!value) return;

		if (!value.brickId) { // inline
			var brick = value;
		} else {
			var brick = meta.nodes.find(node => node.id === value.brickId);
		}
		if (!brick) return;

		let brickSignature = meta.brickLibrary.getBrick(brick.lib, brick.func);
		if (!brickSignature) {
			throw new Error(
				`Error constructing object [${meta.object._id}]! Brick [${v.lib}.${v.func}] - no signature found!`
			);
		}
		let params = {};
		for (let param of brickSignature.params) {
			let value = brick.params[param.code];
			params[param.code] = param.type.construct(value, meta);
		}

		var res = {}
		if (meta.target.format === 'unity') {
			res.type = unityCodes[brickSignature.lib]._type;
			res.params = [];
			if (brickSignature.func.includes('custom')) {
				res.subtype = 10000 + meta.getIntId(brickSignature.func.split('.')[1]);
			} else {
				res.subtype = unityCodes[brickSignature.lib][brickSignature.func];
			}
			for (let [ name, value ] of Object.entries(params)) {
				res.params.push({ name, value });
			}
		}
		if (meta.target.format === 'web') {
			res.lib = brickSignature.lib;
			res.func = brickSignature.func;
			if (res.func.includes('custom')) {
				res.func = 'custom.' + meta.getIntId(res.func.split('.')[1]);
			}
			res.params = params;
		}
		return res;
	};
	valueRender = ValueRender;
	default = () => null;
	eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
	clone = (a) => {
		if (!a) return a;
		return JSON.parse(JSON.stringify(a));
	};
}


// export { SBrick };
