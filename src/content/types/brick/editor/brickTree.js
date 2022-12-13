import { v4 as uuid } from 'uuid';

export class BrickTree {
	maxBrickId = 0;
	constructor(src, brickLibrary) {
		this.src = src;
		this.brickLibrary = brickLibrary;
		this.root = new Brick(src, this);
	}

	getElements() {
		let res = {
			nodes: [],
			edges: [],
		}
		this.root.getElements(res);
		return res;
	}
}

export class Brick {
	params = {};

	constructor(src, brickTree, parent) {
		this.src = src;
		this.parent = parent;
		this.brickTree = brickTree;
		this.signature = brickTree.brickLibrary[src.lib][src.func]
		this.root = brickTree.root;
		this.id = ++this.brickTree.maxBrickId;
		for (let param of this.signature.params) {
			this.params[param.code] = new BrickParam(this, param)
		};
	}

	getNode() {
		return {
			id: `${this.id}`,
			type: 'brick',
			position: { x: 0, y: 0 },
			connectable: true,
			data: {
				brickLibrary: this.brickTree.brickLibrary,
				brick: this,
				signature: this.signature,
			},
		};
	}

	getElements(res) {
		res.nodes.push(this.getNode());
		for (let param of Object.values(this.params)) {
			param.getElements(res);
		}
	}
}


export class BrickParam {
	brick = undefined;
	param = undefined;
	value = undefined;

	constructor(brick, paramSignature) {
		this.brick = brick;
		this.signature = paramSignature;
		if (paramSignature.type.brickType) {
			this.isNested = true;
			this.value = new Brick(brick.src.params[paramSignature.code], brick.brickTree, brick);
			this.edge = {
				id: `e${brick.id}-${this.value.id}`,
				source: `${brick.id}`,
				sourceHandle: `h${brick.id}-${paramSignature.code}`,
				target: `${this.value.id}`,
				type: 'default',
			};
			return;
		}
		if (paramSignature.type.valueType && paramSignature.type.valueType.brickType) {
			return; // TODO: array
		}
		this.value = brick.src.params[paramSignature.code];
	}

	getEdge() {
		return this.edge;
	}

	getElements(res) {
		let edge = this.getEdge();
		if (edge) {
			res.edges.push(edge);
		}
		if (this.value instanceof Brick) {
			this.value.getElements(res)
		}
	}

}


export function convertToNewFormat(src) {
	let maxId = 0;
	let nodes = [];

	const extractBrick = (brick) => {
		let extracted = {
			id: ++maxId,
			lib: brick.lib,
			func: brick.func,
			params: {}
		}
		nodes.push(extracted);
		for (let [ paramCode, value] of Object.entries(brick.params)) {
			if (value.lib) {
				extracted.params[paramCode] = {
					brickId: extractBrick(value).id,
				}
				continue;
			}
			extracted.params[paramCode] = value;
		}		
		return extracted;
	}
	if (src) {
		extractBrick(src);
	}
	return nodes;
}

export function buildElements(src) {
	let nodes = [];
	let edges = [];
	const uuidsByIndex = {};

	const extractElements = (brick) => {
		let node = {
			id: `${brick.id}`,
			type: 'brick',
			dragHandle: '.brick-header',
			position: brick.position ?? { x: 0, y: 0 },
			data: brick,
		}
		nodes.push(node);
		for (let [ paramCode, value] of Object.entries(brick.params)) {
			if (Array.isArray(value)) {
				// TODO:
				continue;
			}
			if (value.brickId) {
				let edge = {
					id: `e.${brick.id}.${paramCode}`,
					source: `${brick.id}`,
					sourceHandle: `h.${brick.id}.${paramCode}`,
					target: `${value.brickId}`,
					type: 'default',
				}
				edges.push(edge)
			}
		}
	}
	for (let brick of src) {
		extractElements(brick)
	}
	return { nodes, edges };
}
