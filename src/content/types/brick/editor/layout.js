import { getRectOfNodes } from 'reactflow';
const ELK = require('elkjs')
const elk = new ELK()

const exportDemonstratorString = (graph) => {
  let res = '';
  let tab = '    '
  for (let [ option, value ] of Object.entries(graph.layoutOptions)) {
    res += `${option}: ${value}\n`;
  }
  res += '\n';
  for (let node of graph.children) {
    res += `node n${node.id} {\n`;
    res += `${tab}layout [ size: ${node.width}, ${node.height} ]\n`;
    if (node.layoutOptions) {
      for (let [option, value] of Object.entries(node.layoutOptions)) {
        res += `${tab}${option}: ${value}\n`
      }
    }
    for (let port of node.ports) {
      let [ nodeId, paramCode ] = port.id.split('.');
      res += `${tab}port p${paramCode.replaceAll(' ', '')} {\n`;
      res += `${tab}${tab}index: ${port.layoutOptions['port.index']}\n`;
      res += `${tab}${tab}side: ${port.layoutOptions['port.side']}\n`;
      res += `${tab}}\n`;
    }
    res += `${tab}label "[ ${node.id} ] ${node.brick.lib}.${node.brick.func}"\n`;
    res += `}\n`;
  }
  res += '\n';
  for (let edge of graph.edges) {
    let [ source, sourceHandle ] = edge.sources[0].split('.');
    let edgeSource = `n${source}`;
    if (sourceHandle) {
      edgeSource += `.p${sourceHandle.replaceAll(' ','')}`;
    }

    let [ target, targetHandle ] = edge.targets[0].split('.');
    let edgeTarget = `n${target}`;
    if (targetHandle) {
      edgeTarget += `.p${targetHandle.replaceAll(' ','')}`;
    }

    res += `edge ${edgeSource} -> ${edgeTarget}\n`
  }
  return res;
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
    let width = 180;
    let height = 50;
    let rect = getRectOfNodes([node]);
    if (rect.width && rect.height) {
      width = rect.width;
      height = rect.height;
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

  console.log(exportDemonstratorString(graph))
  return elk.layout(graph);
};
