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
} from 'reactflow';
import { Brick, BrickPanel, BrickEdge } from './components';
import { Button } from 'antd'
import { buildElements, createBrick } from './utils';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { getLayoutedElements } from './layout';
import { useHotkeyContext } from 'contexts/hotkey';

import 'reactflow/dist/style.css';

const multiSelectionKeys = ['Meta', 'Control']

const nodeTypes = { 
	brick: Brick,
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

	const layout = () => {
		let layouted = getLayoutedElements(nodes, edges, 'RL', brickLibrary);
		fitRequired.current = true;
		setNodes(layouted.nodes);
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
		const jsonBrick = event.dataTransfer.getData('application/reactflow');
		if (typeof jsonBrick === 'undefined' || !jsonBrick) return;
		let { lib, func, params } = JSON.parse(jsonBrick);
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		});
		setNodes(nds => {
			let id = getNextNodeId(nds);
			let brick = createBrick(id, { lib, func }, position, params);
			return nds.concat(brick);
		})
	}, [ reactFlowInstance ]);

	useEffect(() => {
		if (!props.brickType) return;
		let { nodes, edges } = buildElements(props.brickTree);
		if (nodes.length === 0 && props.onSave) {
			let rootValue = brickLibrary.default(props.brickType)
			nodes.push(createBrick(
				0, 
				{ 
					lib: props.brickType, 
					func: 'root',
				}
			));
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
		panOnDrag: !!props.onExit,
		zoomOnScroll: !!props.onExit,
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
			onInit={setReactFlowInstance}
			nodeTypes={nodeTypes}
			edgeTypes={edgeTypes}
			nodes={nodes}
			edges={edges}
			
			multiSelectionKeyCode={multiSelectionKeys}

			{...interactionProps}
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
