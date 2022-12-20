import dagre from 'dagre';
import { getRectOfNodes } from 'reactflow';

export const getLayoutedElements = (nodes, edges, direction = 'RL', brickLibrary) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  const isHorizontal = direction === 'LR' || direction === 'RL';

  dagreGraph.setGraph({ rankdir: direction });
  nodes.forEach((node) => {
  	let width = 180;
  	let height = 50;
  	let rect = getRectOfNodes([node]);
  	if (rect.width && rect.height) {
  		width = rect.width;
  		height = rect.height;
  		node.width = width;
  		node.height = height;
  	} 
    dagreGraph.setNode(node.id, { width, height });
    let signature = brickLibrary.getBrick(node.data.lib, node.data.func);
    if (!signature) return;
    for (let param of signature.params) { // Фrrays are automatically in order
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
