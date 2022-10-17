import dagre from 'dagre';

export default function makeLayoutedElements(elements, nodeSizesByID, rootNodePos, isNode) {
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));
	dagreGraph.setGraph({ rankdir: 'TB', nodestep: 10, rankstep: 60 });

	elements.forEach((elem) => {
		if (isNode(elem)) {
			const dagreNode = { width: 0, height: 0 };
			const size = nodeSizesByID[elem.id];
			if (size) {
				dagreNode.width = size.width;
				dagreNode.height = size.height;
			}
			dagreGraph.setNode(elem.id, dagreNode);
		} else {
			dagreGraph.setEdge(elem.source, elem.target);
		}
	});

	dagre.layout(dagreGraph);

	let firstNodeX = 0;
	return elements.map((elem, index) => {
		if (isNode(elem)) {
			const dagreNode = dagreGraph.node(elem.id);
			let nodeSize = nodeSizesByID[elem.id];
			if (!nodeSize) nodeSize = { width: 0, height: 0 };
			if (index === 0) {
				elem.position = {
					x: rootNodePos.x - nodeSize.width * 0.5,
					y: rootNodePos.y,
				};
				firstNodeX = dagreNode.x;
			} else {
				elem.position = {
					x: rootNodePos.x + dagreNode.x - nodeSize.width * 0.5 - firstNodeX,
					y: rootNodePos.y + dagreNode.y - nodeSize.height * 0.5,
				};
			}
		}
		return elem;
	});
}
