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

export function buildElements(src = []) { // TODO: move brickLibrary to layouting part
	let nodes = [];
	let edges = [];

	const addNode = (brick, position) => {
		console.log('addNode')
		nodes.push({
			id: `${brick.id}`,
			type: 'brick',
			deletable: brick.func !== 'root',
			dragHandle: '.brick-bg',
			position: position ?? { x: 0, y: 0 },
			data: brick,
		});
	}

	const addEdge = (sourceId, targetId, paramCode) => edges.push({
		id: `${sourceId}.${paramCode}`,
		source: `${sourceId}`,
		sourceHandle: `${paramCode}`,
		target: `${targetId}`,
		type: 'default',
		data: {
			paramCode: paramCode
		}
	});

	const extractElements = (brick) => {
		let data = {
			id: brick.id,
			lib: brick.lib,
			func: brick.func,
			params: { ...brick.params }
		}
		addNode(data, brick.position);
		for (let [ paramCode, value ] of Object.entries(brick.params)) {
			if (!value) continue;
			if (Array.isArray(value)) {
				// TODO:
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
