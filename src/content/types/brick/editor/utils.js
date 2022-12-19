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

	const addEdge = (sourceId, targetId, paramCode) => edges.push({
		id: `${sourceId}.${paramCode}`,
		source: `${sourceId}`,
		sourceHandle: `${paramCode}`,
		target: `${targetId}`,
		type: 'default',
	});

	const extractElements = (brick) => {
		let node = addNode(brick);
		for (let [ paramCode, value ] of Object.entries(brick.params)) {
			if (!value) continue;
			if (Array.isArray(value)) { // array of bricks
				if (value.length === 0) continue;
				if (!value[0].brickId) continue;
				node.data.params[paramCode] = [];
				for (let item of value) {
					let targetBrick = src.find(b => b.id === item.brickId);
					if (targetBrick) {
						let itemUuid = uuid();
						node.data.params[paramCode].push(itemUuid)
						addEdge(brick.id, targetBrick.id, `${paramCode}.${itemUuid}`);
					}
				}
				continue;
			}
			if (value.brickId) {
				let targetBrick = src.find(b => b.id === value.brickId);
				if (targetBrick) {
					addEdge(brick.id, targetBrick.id, paramCode)
				}
			}
		}
	}
	for (let node of src) {
		extractElements(node)
	}
	return { nodes, edges };
}
