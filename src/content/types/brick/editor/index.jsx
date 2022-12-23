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
import { Brick, BrickPanel } from './components';
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
		console.log('START')
		edgeUpdateSuccessful.current = false;
	}, []);

	const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
		edgeUpdateSuccessful.current = true;
		setEdges((els) => updateEdge(oldEdge, newConnection, els));
	}, []);

	const onEdgeUpdateEnd = useCallback((event, edge, connection, arg) => {
		console.log('END:', event, connection, arg)
		if (!edgeUpdateSuccessful.current) {
			setEdges((eds) => eds.filter((e) => e.id !== edge.id));
		}
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
		let { lib, func, defaultParams } = JSON.parse(jsonBrick);
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		});
		setNodes(nds => {
			let id = getNextNodeId(nds);
			let brick = createBrick(id, { lib, func }, position, defaultParams);
			return nds.concat(brick);
		})
	}, [ reactFlowInstance ]);

	useEffect(() => {
		if (!props.brickType) return;
		let { nodes, edges } = buildElements(props.brickTree);
		if (nodes.length === 0 && props.onSave) {
			nodes.push(createBrick(0, { 
				lib: props.brickType, 
				func: 'root'
			}))
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

	const saveChanges = useCallback(() => { // TODO: move to utils
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
		props.onSave(Object.values(bricks));
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
			nodes={nodes}
			edges={edges}
			
			multiSelectionKeyCode={multiSelectionKeys}

			{...interactionProps}
			fitView
			proOptions={{ hideAttribution: true }}
		>
			{props.onSave && <Panel position='top-left'>
					<BrickPanel/>
				</Panel>
			}
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
