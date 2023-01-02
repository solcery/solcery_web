import { v4 as uuid } from 'uuid';
import { MarkerType } from 'reactflow';

export function createComment(comment) {
	return {
		id: `${comment.id}`,
		type: 'comment',
		deletable: true,
		position: comment.position,
		data: comment,
	}
}

export function createNode(src) {
	if (src.nodeType === 'comment') {
		return createComment(src);
	}
	return createBrick(src);
}

export function createBrick(brick) {
	return {
		id: `${brick.id}`,
		type: 'brick',
		deletable: brick.func !== 'root',
		position: brick.position,
		dragHandle: '.brick-bg',
		zIndex: 1,
		data: brick,
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

export function buildElements(src = [], offsetId = 0, offsetPosition) { // TODO: move brickLibrary to layouting part
	let nodes = [];
	let edges = [];

	const addNode = (brick) => {
		let data = {
			...brick
		}
		data.id += offsetId;
		if (offsetPosition) {
			data.position.x += offsetPosition.x ?? 0;
			data.position.y += offsetPosition.y ?? 0;
		}
		nodes.push(createBrick(data));
	}

	const addEdge = (sourceId, targetId, paramCode, index) => {
		edges.push(createEdge(sourceId + offsetId, targetId + offsetId, paramCode, index));
	}

	const addComment = (src) => {
		let data = {...src};
		data.id += offsetId;
		nodes.push(createComment(data));
	}

	const extractElements = (brick) => {
		addNode(brick);
		for (let [ paramCode, value ] of Object.entries(brick.params)) {
			if (!value) continue;
			if (Array.isArray(value)) { // array of bricks
				value.forEach((item, index) => {
					if (!item.brickId) return;
					let targetBrick = src.find(b => b.id === item.brickId);
					if (!targetBrick) return;
					item.brickId += offsetId;
					addEdge(brick.id, targetBrick.id, paramCode, index);
				});
				continue;
			}
			if (value.brickId) {
				let targetBrick = src.find(b => b.id === value.brickId);
				if (targetBrick) {
					value.brickId += offsetId;
					addEdge(brick.id, targetBrick.id, paramCode);
				}
			}
		}
	}
	if (Array.isArray(src)) {
		for (let node of src) {
			if (node.nodeType === 'comment') {
				addComment(node);
			} else {
				extractElements(node)
			}
		}
	}
	return { nodes, edges };
}
