import dagre from 'dagre';
import { getRectOfNodes } from 'reactflow';
import { BrickLibrary } from 'content/brickLib/brickLibrary';
import { v4 as uuid } from 'uuid';

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

export const getLayoutedElements = (nodes, edges, direction = 'RL', brickLibrary) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR' || direction === 'RL';

  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => {
  	let width = 230;
  	let height = 150;
  	node.width = width;
  	node.height = height;
    let signature = brickLibrary.getBrick(node.data.lib, node.data.func);
  	if (signature) {
  		width = Math.min(250, 130 + signature.name.length * 7);
  		height = 30;
  		for (let param of signature.params) {
  			if (param.type.brickType) {
  				height += 30;
  			} else {
  				height += 65;
  				width = 220;
  			}
  		}
  		height = Math.max(height, 55);
  		node.width = width;
  		node.height = height;
  	}
    dagreGraph.setNode(node.id, { width, height });
    if (!signature) return;
    for (let param of signature.params) { // arrays are automatically in order
      if (param.type.brickType) {
        let edgeId = `${node.id}.${param.code}`;
        let edge = edges.find(edge => edge.id === edgeId)
        if (!edge) return;
        dagreGraph.setEdge(edge.source, edge.target); 
        continue;
      }
    }
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });
  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';

    // We are shifting the dagre node position (anchor=center center) to the top left
    // so it matches the React Flow node anchor point (top left).
    node.position = {
      x: nodeWithPosition.x - node.width / 2,
      y: nodeWithPosition.y - node.height / 2,
    };

    return node;
  });

  return { nodes: [...nodes], edges: [...edges] };
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
			} else if (Array.isArray(value) && value[0].lib) {
				extracted.params[paramCode] = [];
				for (let nestedBrick of value) {
					extracted.params[paramCode].push({
						brickId: extractBrick(nestedBrick).id,
					})
				}
			} else {
				extracted.params[paramCode] = value;
			}
		}		
		return extracted;
	}
	if (src) {
		nodes.push({
			id: ++maxId,
			lib: src.lib,
			func: 'root',
			params: {
				value: {
					brickId: 2,
				}
			}
		})
		extractBrick(src);
	}
	return nodes;
}

const debug = {
	log: false,
}

const saveChanges = (nodes, edges, brickLibrary) => {
	let bricks = {};
	for (let node of nodes) {
		let brick = {
			id: node.data.id,
			lib: node.data.lib,
			func: node.data.func,
			params: {}
		}
		bricks[node.id] = brick;
		brick.position = node.position;
		let brickSignature = brickLibrary.getBrick(brick.lib, brick.func);
		if (!brickSignature) continue;
		let params = brickSignature.params;
		for (let param of params) {
			if (param.type.brickType) { //Brick
				let edge = edges.find(e => e.id === `${brick.id}.${param.code}`)
				if (edge) {
					brick.params[param.code] = { brickId: parseInt(edge.target) };
				}
			} else if (param.type.valueType && param.type.valueType.brickType) { // Array of bricks
				brick.params[param.code] = [];
				for (let paramUuid of node.data.params[param.code]) {
					let edge = edges.find(e => e.id === `${brick.id}.${param.code}.${paramUuid}`)
					if (edge) {
						brick.params[param.code].push({ brickId: parseInt(edge.target) });
					}
				}
			} else {
				brick.params[param.code] = node.data.params[param.code];
			}
		}
	}
	return Object.values(bricks);
}

export const migrator = (content) => {
	

	let objects = [];
	for (let object of content.objects) { // migration
		for (let [field, value] of Object.entries(object.fields)) {
			if (value && value.brickTree) {
				let nodes = convertToNewFormat(value.brickTree);
				let newValue = {
					nodes,
					migratedBrick: true,
				}
				if (value.brickParams) {
					newValue.params = value.brickParams.map(param => ({
						name: param.key,
						type: param.value,
					}))
				}
				object.fields[field] = newValue;
			}
		}
	}

	const brickLibrary = new BrickLibrary();
	brickLibrary.addCustomBricks(content);
	console.log(brickLibrary)

	for (let object of content.objects) { // layouting
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (value && value.migratedBrick) { // ol
				let unlayoutedElements = buildElements(value.nodes);
				let layouted = getLayoutedElements(unlayoutedElements.nodes, unlayoutedElements.edges, 'RL', brickLibrary);
				let nodes = saveChanges(layouted.nodes, layouted.edges, brickLibrary);
				object.fields[field].nodes = nodes;
				changed = true;
			}
		}
		if (changed) objects.push(object);
	}

	return { objects };
};
