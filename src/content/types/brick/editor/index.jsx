import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
	Panel,
	Background, 
	applyNodeChanges, 
	useNodesState, 
	useEdgesState,
	updateEdge,
	addEdge,
	Handle,
	SelectionMode,
} from 'reactflow';
import { Brick, BrickPanel, BrickEdge, Comment } from './components';
import { Button } from 'antd'
import { buildElements, createNode } from './utils';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { elkLayout } from './layout';
import { useHotkeyContext, useHotkey } from 'contexts/hotkey';
import { notif } from 'components/notification';

import 'reactflow/dist/style.css';

const multiSelectionKeys = ['Meta', 'Control']

const nodeTypes = { 
	brick: Brick,
	comment: Comment,
};

const edgeTypes = {
	edge: BrickEdge,
}

const getNextNodeId = (nodes) => Math.max(0, ...nodes.map(node => parseInt(node.id))) + 1;

export const BrickEditor = (props) => {
	const { addHotkey, removeHotkey } = useHotkeyContext();
	const { brickLibrary } = useBrickLibrary();

	const [nodes, setNodes, onNodesChange] = useNodesState();
	const [edges, setEdges, onEdgesChange] = useEdgesState();
	const edgeUpdateSuccessful = useRef(true);
	const brickEditorRef = useRef();

	const fitRequired = useRef(false)
	const [ reactFlowInstance, setReactFlowInstance ] = useState();


	const copy = (event) => {
		if (event.target.tagName === 'INPUT') return;
		event.preventDefault();
		if (!reactFlowInstance) return;
		let selectedNodes = reactFlowInstance.getNodes().filter(node => node.selected && node.data.func !== 'root');
		let bricks = selectedNodes.map(node => node.data);
		let jsonData = JSON.stringify(bricks);
		event.clipboardData.setData('text/plain', jsonData)
	}	

	const cut = (event) => {
		if (event.target.tagName === 'INPUT') return;
		event.preventDefault();
		if (!reactFlowInstance) return;
		let selectedNodes = reactFlowInstance.getNodes().filter(node => node.selected && node.data.func !== 'root');
		let bricks = selectedNodes.map(node => node.data);
		let jsonData = JSON.stringify(bricks);
		event.clipboardData.setData('text/plain', jsonData)
		reactFlowInstance.deleteElements({ nodes: selectedNodes });
	}

	const paste = (event) => {
		if (!reactFlowInstance) return;
		let jsonData = (event.clipboardData || window.clipboardData).getData('text');
		let data;
		try {
			data = JSON.parse(jsonData);
		} catch (e) {
			notif.error('Invalid brick', e.message);
			return;
		}
		let offsetId = getNextNodeId(reactFlowInstance.getNodes());
		let elements = buildElements(data, offsetId);
		if (elements.nodes.length === 0 && elements.edges.length === 0) {
			notif.warning('No bricks found in clipboard');
			return;
		}
		const offsetX = 100;
		const offsetY = 100;

		for (let node of elements.nodes) {
			node.selected = true;
			node.position.x += offsetX;
			node.position.y += offsetY;
			node.data.position.x += offsetX;
			node.data.position.y += offsetY;
		}
		let nodes = reactFlowInstance.getNodes();
		for (let node of nodes) {
			node.selected = false;
		}

		for (let edge of elements.edges) {
			edge.selected = true;
		}
		let edges = reactFlowInstance.getEdges();
		for (let edge of edges) {
			edge.selected = false;
		}
		reactFlowInstance.setNodes(nodes.concat(elements.nodes));
		reactFlowInstance.setEdges(edges.concat(elements.edges));
		notif.success('Pasted successfully');
	}

	useEffect(() => {
		if (!reactFlowInstance) return;
		if (!props.onSave) return;
		window.addEventListener('copy', copy);
		window.addEventListener('cut', cut);
		window.addEventListener('paste', paste);
		return () => {
			window.removeEventListener('copy', copy);
			window.addEventListener('cut', cut);
			window.removeEventListener('paste', paste);
		}
	}, [ reactFlowInstance, props.onSave ])

	const onInit = (reactFlowInstance) => {
		setReactFlowInstance(reactFlowInstance);
		if (props.onInit) props.onInit();
	}

	const layout = async () => {
		let layoutedGraph = await elkLayout(nodes, edges, brickLibrary);
		let nds = reactFlowInstance.getNodes();
	    nds.forEach((node) => {
	      const nodeWithPosition = layoutedGraph.children.find(child => child.id === node.id);
	      if (!nodeWithPosition) return;
	      node.position = {
	        x: nodeWithPosition.x,
	        y: nodeWithPosition.y
	      }
	    });
	    setNodes([ ...nds ]);
	}
	
	const onEdgeUpdateStart = useCallback((event, edge) => {
		edgeUpdateSuccessful.current = false;
	}, []);

	const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
		if (newConnection.target === oldEdge.target) {
			edgeUpdateSuccessful = true;
		}
	}, []);

	const onEdgeUpdateEnd = useCallback((event, edge, connection, arg) => {
		if (!edgeUpdateSuccessful.current) {
			setEdges((eds) => eds.filter(e => e.id !== edge.id));
		};
		edgeUpdateSuccessful.current = true;
	}, []);

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback((event) => {
		event.preventDefault();

		const reactFlowBounds = brickEditorRef.current.getBoundingClientRect();
		const jsonNode = event.dataTransfer.getData('application/reactflow');
		if (typeof jsonNode === 'undefined' || !jsonNode) return;
		let node = JSON.parse(jsonNode);
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		});
		let nodes = reactFlowInstance.getNodes();
		let id = getNextNodeId(nodes);
		let newNode = createNode({ ...node, id, position });
		console.log(newNode)
		reactFlowInstance.setNodes(nodes.concat(newNode));
	}, [ reactFlowInstance ]);



	useEffect(() => {
		if (!props.brickType) return;
		let { nodes, edges } = buildElements(props.brickTree);
		if (nodes.length === 0 && props.onSave) {
			let rootValue = brickLibrary.default(props.brickType)
			nodes.push(createNode({ 
				id: 0,
				lib: props.brickType, 
				func: 'root',
				position: {
					x: 0,
					y: 0,
				},
				params: {

				}
			}));
		}
		setNodes(nodes);
		setEdges(edges);
	}, [ props.brickType, props.brickTree, props.onSave ])

	useEffect(() => {
		if (!fitRequired.current) return;
		if (!reactFlowInstance) return;
		fitRequired.current = false;
		reactFlowInstance.fitView();
	}, [ nodes, reactFlowInstance ])


	const exit = () => {
		props.onExit();
	}

	const saveChanges = useCallback(() => {
		props.onSave(nodes.map(node => node.data));
	}, [ nodes, edges, props.onSave ]);

	useEffect(() => {
		if (!props.onExit) return;
		const hotkeySubscription = addHotkey({
			key: 'Escape',
			callback: exit,
		})
		return () => removeHotkey('Escape', hotkeySubscription);
	}, [ props.onExit ]);

	useEffect(() => {
		if (!props.onSave) return;
		const hotkeySubscription = addHotkey({
			key: 'Ctrl+KeyS',
			callback: saveChanges,
			noDefault: true,
		})
		return () => removeHotkey('Ctrl+KeyS', hotkeySubscription);
	}, [ props.onSave, saveChanges ])

	const interactionProps = {
		elementsSelectable: !!props.onSave,
		nodesConnectable: !!props.onSave,
		nodesDraggable: !!props.onSave,
		nodesFocusable: !!props.onSave,
		// zoomOnScroll: !!props.onExit,
	}

	if (props.onSave) {
		interactionProps.onEdgeUpdate = onEdgeUpdate;
		interactionProps.onEdgeUpdateStart = onEdgeUpdateStart;
		interactionProps.onEdgeUpdateEnd = onEdgeUpdateEnd;
		interactionProps.onDrop = onDrop;
		interactionProps.onDragOver = onDragOver;
		interactionProps.onNodesChange = onNodesChange;
		interactionProps.onEdgesChange = onEdgesChange;
	}

	if (!props.onSave) {
		interactionProps.minZoom = 0.01;
	}

	if (!brickLibrary) return;
	return <div
		style={{ width: '100%', height: '100%' }}
		ref={brickEditorRef}
	>
		<ReactFlow
			onInit={onInit}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			nodes={nodes}
			edges={edges}

			{...interactionProps}
			panOnDrag={false}
			panOnScroll={true}
			selectionOnDrag
			selectionMode={SelectionMode.Partial}
			
			multiSelectionKeyCode={multiSelectionKeys}

			fitView
			proOptions={{ hideAttribution: true }}
		>
			{props.onSave && <BrickPanel/>}
			{props.onExit && <>
				<Panel position='top-right'>
					<Button onClick={exit}>EXIT</Button>
					{props.onSave && <>
						<Button onClick={saveChanges}>SAVE</Button>
						<Button onClick={() => layout()}>Layout</Button>	
					</>}
				</Panel>
				<Background />
			</>}
		</ReactFlow>
	</div>;
};

export default BrickEditor;
