import { v4 as uuid } from 'uuid';

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
			if (!value) continue;
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

export function buildElements(src, brickLibrary) { // TODO: move brickLibrary to layouting part
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
		let paramSignatures = brickLibrary[brick.lib][brick.func].params;
		for (let param of paramSignatures) {
			let value = brick.params[param.code];
			if (!value) continue;
			if (Array.isArray(value)) {
				// TODO:
				continue;
			}
			if (value.brickId) {
				let edge = {
					id: `${brick.id}.${param.code}`,
					source: `${brick.id}`,
					sourceHandle: `${param.code}`,
					target: `${value.brickId}`,
					type: 'default',
					data: {
						paramCode: param.code
					}
				}
				edges.push(edge);
			}
		}
	}
	for (let brick of src) {
		extractElements(brick)
	}
	return { nodes, edges };
}
