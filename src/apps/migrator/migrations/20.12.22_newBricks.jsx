import dagre from 'dagre';
import { getRectOfNodes } from 'reactflow';
import { BrickLibrary } from 'content/brickLib/brickLibrary';
import { v4 as uuid } from 'uuid';
const ELK = require('elkjs')
const elk = new ELK()

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


export const elkLayout = (nodes, edges, brickLibrary) => {
  var graph = {
    id: 'root',
    layoutOptions: { 
      'elk.algorithm': 'layered',
      'elk.edgeRouting': 'SPLINES',
      'elk.direction': 'RIGHT',
      'elk.layered.edgeRouting.splines.mode': 'SLOPPY',
      // 'elk.layered.nodePlacement.favorStraightEdges': 'true',
      'elk.spacing.nodeNode': '90',
      'layered.spacing.nodeNodeBetweenLayers': '120',
      'nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: [],
    edges: []
  };

  const addEdge = (edge) => {
    let targetNode = nodes.find(node => node.id === edge.target);
    if (targetNode.data.lib === 'action') {
      graph.edges.push({ 
        id: edge.id, 
        sources: [ `${edge.source}.${edge.sourceHandle}` ],
        targets: [ `${edge.target}.${edge.targetHandle}` ], 
      });
    } else {
      graph.edges.push({
        id: edge.id, 
        sources: [ `${edge.target}.${edge.targetHandle}` ], 
        targets: [ `${edge.source}.${edge.sourceHandle}` ], 
      });
    }
  }

  const addNode = (node) => {
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
    let nd = { 
      id: node.id, 
      brick: node.data,
      layoutOptions: {
        'elk.portConstraints': 'FIXED_ORDER',
        'elk.portAlignment.west': 'DISTRIBUTED',
        'elk.portAlignment.east': 'DISTRIBUTED',
        'elk.layered.portSortingStrategy': 'INPUT_ORDER',
      },
      width: width, 
      height: height,
      ports: [],
    }
    const addPort = (id, side) => {
      let sidePorts = nd.ports.filter(port => port.layoutOptions['port.side'] === side);
      let index = 0;
      if (side === 'EAST') {
        index = sidePorts.length;
      } else {
        sidePorts.forEach(port => port.layoutOptions['port.index']++);
      }
      nd.ports.push({
        id,
        layoutOptions: {
          'port.side': side,
          'port.index': index,
        }
      })
    }
    if (node.data.lib) {
      if (node.data.func !== 'root') {
        let side = node.data.lib === 'action' ? 'WEST' : 'EAST';
        addPort(`${node.id}._out`, side)
      }

      let signature = brickLibrary.getBrick(node.data.lib, node.data.func)
      for (let param of signature.params) {
        if (param.type.brickType) {
          let side = param.type.brickType === 'action' ? 'EAST' : 'WEST';
          addPort(`${node.id}.${param.code}`, side)
        }
      }
      graph.children.push(nd);
      return;
    }
    if (node.data.nodeType === 'comment') {
      if (node.data.for !== undefined) {
        nd.layoutOptions['elk.commentBox'] = 'true';
        graph.edges.push({
          id: `comment${node.id}`, 
          sources: [ `${node.id}` ], 
          targets: [ `${node.data.for}` ], 
        });
        graph.children.push(nd);
      }
      return;
    }
    
  }

  nodes.forEach(node => addNode(node));
  edges.forEach(edge => addEdge(edge));

  return elk.layout(graph);
};

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

export function convertToNewFormat(src, content) {
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
			let comments = nodes.filter(node => node.nodeType === 'comment' && node.for === brick.id);
			comments.forEach(node => node.for = action1pipe.head.id);
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
				comment: src.comment,
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
				comment: src.comment,
				params: {
					value: true,
				}
			}
		}
		if (src.func === 'custom.6305d24d1911c1b8d049edb8') {
			return {
				lib: 'condition',
				func: 'const',
				comment: src.comment,
				params: {
					value: false,
				}
			}
		}
		if (src.lib === 'action' && src.func === 'two') {
			if (isDefault(src.params.action1)) {
				var res = JSON.parse(JSON.stringify(src.params.action2))
			} else if (isDefault(src.params.action2)) {
				var res = JSON.parse(JSON.stringify(src.params.action1))
			} else {
				var res = JSON.parse(JSON.stringify(src));
			}
			res.comment = src.comment;
			return res;
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
		if (brick.comment) {
			nodes.push({
				id: ++maxId,
				nodeType: 'comment',
				for: extracted.id,
				text: brick.comment,
			})
		}
		nodes.push(extracted);

		const [ _, customId ] = brick.func.split('.');
		if (customId) {
			let object = content.objects.find(obj => obj._id === customId);
			var customParams = object.fields.brick.brickParams ?? [];
		}

		for (let [ paramCode, value] of Object.entries(brick.params)) {
			if (customParams && !customParams.find(param => param.key === paramCode)) {
				continue;
			}

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
		if (node.data.nodeType === 'comment') {
			bricks[node.id] = {
				...node.data,
				position: node.position
			}
			continue;
		}
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

export const migrator = async (content) => {
	
	let copiedContent = JSON.parse(JSON.stringify(content))
	let objects = [];
	for (let object of content.objects) { // migration
		for (let [field, value] of Object.entries(object.fields)) {
			if (value && value.brickTree) {
				let nodes = convertToNewFormat(value.brickTree, copiedContent);
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
			if (value && value.migratedBrick) {
				let elements = buildElements(value.nodes);
				let layoutedGraph = await elkLayout(elements.nodes, elements.edges, brickLibrary);
				elements.nodes.forEach((node) => {
		      const nodeWithPosition = layoutedGraph.children.find(child => child.id === node.id);
		      if (!nodeWithPosition) return;
		      node.position = {
		        x: nodeWithPosition.x,
		        y: nodeWithPosition.y
		      }
		    });
				let nodes = saveChanges(elements.nodes, elements.edges, brickLibrary);
				object.fields[field].nodes = nodes;
				object.fields[field].comments = undefined;
				object.fields[field].migratedBrick = undefined;
				changed = true;
			}
		}
		if (changed) objects.push(object);
	}
	return { objects };
};

