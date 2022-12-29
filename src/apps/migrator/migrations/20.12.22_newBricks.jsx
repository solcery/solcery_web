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

  const addEdge = (edge) => {
    let targetNode = nodes.find(node => node.id === edge.target);
    if (targetNode.data.lib === 'action') {
      dagreGraph.setEdge(edge.target, edge.source); 
    } else {
      dagreGraph.setEdge(edge.source, edge.target); 
    }
  }

  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => {
  	let width = 230;
  	let height = 150;
  	node.width = width;
  	node.height = height;
    let signature = brickLibrary.getBrick(node.data.lib, node.data.func);
  	if (signature) {
  		width = Math.min(300, 130 + signature.name.length * 7);
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
        addEdge(edge); 
        continue;
      }
    }
  });

  edges.forEach((edge) => {
    addEdge(edge);
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
				node.data.params[paramCode] = [];
				for (let item of value) {
					if (!item.brickId) continue;
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

function appendBrick(tails, brick) {
	for (let tail of tails) {
		if (tail.func === 'if_then') {
			if (!tail.params.then.brickId) {
				tail.params.then = { brickId: brick.id };
			};
			if (!tail.params.else.brickId) {
				tail.params.else = { brickId: brick.id };
			};
		} else {
			tail.params._next = { brickId: brick.id};
		}
	}
}

function filterInPlace(a, condition) {
  let i = 0, j = 0;

  while (i < a.length) {
    const val = a[i];
    if (condition(val, i, a)) a[j++] = val;
    i++;
  }

  a.length = j;
  return a;
}

const isDefault = (brick) => {
	if (brick.lib === 'action' && brick.func === 'void') return true;
	if (brick.lib === 'condition' && brick.func === 'const') return true;
	if (brick.lib === 'value' && brick.func === 'const') return true;
}

export function convertToNewFormat(src) {
	let maxId = 1;
	let nodes = [];

	function buildPipeline(brick) {
		if (brick.lib !== 'action') return { head: brick, tails: [ brick ] };
		if (brick.func === 'two') {
			filterInPlace(nodes, node => node.id !== brick.id)
			let action1 = nodes.find(node => node.id === brick.params.action1.brickId);
			let action2 = nodes.find(node => node.id === brick.params.action2.brickId);
			let action1pipe = buildPipeline(action1);
			let action2pipe = buildPipeline(action2);
			appendBrick(action1pipe.tails, action2pipe.head);
			return { head: action1pipe.head, tails: action2pipe.tails };
		}
		if (brick.func === 'if_then') {
			let tails = [];
			if (brick.params.then.brickId) {
				let actionThen = nodes.find(node => node.id === brick.params.then.brickId);
				let thenPipeline = buildPipeline(actionThen);
				brick.params.then = { brickId: thenPipeline.head.id };
				tails = tails.concat(thenPipeline.tails);
			}
			if (brick.params.else.brickId) {
				let actionElse = nodes.find(node => node.id === brick.params.else.brickId);
				let elsePipeline = buildPipeline(actionElse);
				brick.params.else = { brickId: elsePipeline.head.id };
				tails = tails.concat(elsePipeline.tails)
			}
			if (!brick.params.else.brickId || !brick.params.then.brickId) {
				tails = tails.concat(brick);
			}

			return { head: brick, tails };
		}
		for (let [ paramCode, value ] of Object.entries(brick.params)) {
			if (value.brickId === undefined) continue;
			let childBrick = nodes.find(node => node.id === value.brickId);
			if (childBrick.lib !== 'action') continue;
			let { head, tails } = buildPipeline(childBrick);
			brick.params[paramCode] = { brickId: head.id };
		}
		return { head: brick, tails: [ brick ]};
	}

	const migrateBrick = (src) => {
		if (src.func === 'custom.6305d1e81aa9e92b91bb50a5') {
			return {
				lib: 'action',
				func: 'if_then',
				params: {
					if: src.params.Condition,
					then: src.params.Action,
					else: {
						lib: 'action',
						func: 'void',
						params: {}
					}
				}
			}
		}
		if (src.func === 'custom.6305d22963590279329c0bd7') {
			return {
				lib: 'condition',
				func: 'const',
				params: {
					value: true,
				}
			}
		}
		if (src.func === 'custom.6305d24d1911c1b8d049edb8') {
			return {
				lib: 'condition',
				func: 'const',
				params: {
					value: false,
				}
			}
		}
		if (src.lib === 'action' && src.func === 'two') {
			if (isDefault(src.params.action1)) {
				return JSON.parse(JSON.stringify(src.params.action2))
			} else if (isDefault(src.params.action2)) {
				return JSON.parse(JSON.stringify(src.params.action1))
			} else {
				return JSON.parse(JSON.stringify(src));
			}
		}
		return src;
	}

	const extractBrick = (brick) => {
		let extracted = {
			id: ++maxId,
			lib: brick.lib,
			func: brick.func,
			params: {},
		}
		nodes.push(extracted);
		for (let [ paramCode, value] of Object.entries(brick.params)) {
			if (value === undefined || value === null) continue;
			if (value.lib) {
				let migratedValue = migrateBrick(value);
				if (isDefault(migratedValue)) {
					extracted.params[paramCode] = migratedValue;
				} else {
					extracted.params[paramCode] = {
						brickId: extractBrick(migratedValue).id,
					}
				}
			} else if (Array.isArray(value) && value[0].lib) {
				extracted.params[paramCode] = [];
				for (let nestedBrick of value) {
					let migratedValue = migrateBrick(nestedBrick);
					if (isDefault(migratedValue)) {
						extracted.params[paramCode] = migratedValue;
					} else {
						extracted.params[paramCode] = {
							brickId: extractBrick(migratedValue).id,
						}
					}
				}
			} else {
				extracted.params[paramCode] = value;
			}
		}
		return extracted;
	}
	if (src) {
		let extracted = extractBrick(migrateBrick(src));
		let { head } = buildPipeline(extracted);
		nodes.unshift({
			id: 1,
			lib: src.lib,
			func: 'root',
			params: {
				value: {
					brickId: head.id,
				}
			}
		})
	}
	return nodes;
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
				if (node.data.params[param.code] && !node.data.params[param.code].brickId) { // inline
					brick.params[param.code] = node.data.params[param.code];
					continue;
				}
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
	// return {};
	return { objects };
};



// 6305d22963590279329c0bd7 true
// 6305d24d1911c1b8d049edb8 false