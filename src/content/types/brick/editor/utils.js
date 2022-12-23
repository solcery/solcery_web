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

export function createEdge(sourceId, targetId, sourceHandle) { // TODO: style => type
	let isPipeline = sourceHandle === '_next';
	if (isPipeline) {
		var pipelineProps = {
			// markerEnd: {
			// 	type: MarkerType.ArrowClosed,
			// },
			animated: true,
			style: { strokeWidth: '3px' }
		}
	}
	return {
		id: `${sourceId}.${sourceHandle}`,
		source: `${sourceId}`,
		sourceHandle: `${sourceHandle}`,
		target: `${targetId}`,
		targetHandle: '_out',
		type: 'default',
		...pipelineProps
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

	const addEdge = (sourceId, targetId, sourceHandle) => {
		let edge = createEdge(sourceId, targetId, sourceHandle);
		edges.push(edge);
	}

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
					addEdge(brick.id, targetBrick.id, paramCode);
				}
			}
		}
	}
	for (let node of src) {
		extractElements(node)
	}
	return { nodes, edges };
}
