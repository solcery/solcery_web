import { v4 as uuid } from 'uuid';
import { MarkerType } from 'reactflow';

export function createBrick(id, signature, position = { x: 0, y: 0}, params = {}) {
	return {
		id: `${id}`,
		type: 'brick',
		deletable: signature.func !== 'root',
		position,
		dragHandle: '.brick-bg',
		data: {
			id,
			lib: signature.lib, 
			func: signature.func,
			params,
		},
	}
};

export function createEdge(sourceId, targetId, paramCode, index) { // TODO: style => type
	let sourceHandle = `${paramCode}`;
	if (index !== undefined) {
		sourceHandle += `.${index}`;
	}
	return {
		id: `${sourceId}.${sourceHandle}`,
		source: `${sourceId}`,
		sourceHandle,
		target: `${targetId}`,
		targetHandle: '_out',
		type: 'edge',
		data: {
			paramCode,
		},
	}
}

export function buildElements(src = []) { // TODO: move brickLibrary to layouting part
	let nodes = [];
	let edges = [];

	const addNode = (brick) => {
		let id = brick.id;
		let position = brick.position;
		let signature = { lib: brick.lib, func: brick.func };
		let params = { ...brick.params }
		let node = createBrick(id, signature, position, params);
		nodes.push(node);
		return node;
	}

	const extractElements = (brick) => {
		let node = addNode(brick);
		for (let [ paramCode, value ] of Object.entries(brick.params)) {
			if (!value) continue;
			if (Array.isArray(value)) { // array of bricks
				value.forEach((item, index) => {
					if (!item.brickId) return;
					let targetBrick = src.find(b => b.id === item.brickId);
					if (!targetBrick) return;
					edges.push(createEdge(brick.id, targetBrick.id, paramCode, index));
				});
				continue;
			}
			if (value.brickId) {
				let targetBrick = src.find(b => b.id === value.brickId);
				if (targetBrick) {
					edges.push(createEdge(brick.id, targetBrick.id, paramCode));
				}
			}
		}
	}
	for (let node of src) {
		extractElements(node)
	}
	return { nodes, edges };
}
