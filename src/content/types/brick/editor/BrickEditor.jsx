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
import { Brick } from './components';
import 'reactflow/dist/style.css';
import { Button } from 'antd'
import { BrickTree, convertToNewFormat, buildElements } from './brickTree';
import { BrickPanel } from './components/BrickPanel';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { v4 as uuid } from 'uuid';
import { getLayoutedElements } from './layout';

import dagre from 'dagre';

const multiSelectionKeys = ['Meta', 'Control']


const CustomNodeTest = ({ id, data }) => {
	return (
		<>
			<Handle
				type="target"
				position="top"
				style={{ background: '#555' }}
				onConnect={(params) => console.log('handle onConnect', params)}
				isConnectable={true}
			/>
			<div>
				Custom Inline
			</div>
			<Handle
				type="source"
				position="bottom"
				id="b"
				style={{ bottom: 10, top: 'auto', background: '#555' }}
				isConnectable={true}
			/>
		</>
	);
};

const nodeTypes = { brick: Brick };

const getNextNodeId = (nodes) => `${Math.max(...nodes.map(node => parseInt(node.id))) + 1}`;

export const BrickEditor = (props) => {
	const { brickLibrary } = useBrickLibrary();
	let width = props.fullscreen ? window.innerWidth : 300;
	let height = props.fullscreen ? window.innerHeight : 200;

	const [nodes, setNodes, onNodesChange] = useNodesState([]);
	const [edges, setEdges, onEdgesChange] = useEdgesState([]);
	const edgeUpdateSuccessful = useRef(true);
	const brickEditorRef = useRef();

	const fit = useRef(false)
	const [ reactFlowInstance, setReactFlowInstance ] = useState();

	useEffect(() => {
		if (!brickLibrary || !props.brickTree) return;
		let elements = buildElements(props.brickTree, brickLibrary);
		setNodes(elements.nodes);
		setEdges(elements.edges);
	}, [ brickLibrary, props.brickTree ])

	const layout = () => {
		let layouted = getLayoutedElements(nodes, edges, 'RL');
		setNodes(layouted.nodes);
		setEdges(layouted.edges);
	}
	
	const onEdgeUpdateStart = useCallback((event, edge) => {
		edgeUpdateSuccessful.current = false;
	}, []);

	const onEdgeUpdate = useCallback((oldEdge, newConnection) => {
		edgeUpdateSuccessful.current = true;
		setEdges((els) => updateEdge(oldEdge, newConnection, els));
	}, []);

	const onEdgeUpdateEnd = useCallback((_, edge) => {
		if (!edgeUpdateSuccessful.current) {
			setEdges((eds) => eds.filter((e) => e.id !== edge.id));
		}
		edgeUpdateSuccessful.current = true;
	}, []);

	useEffect(() => {
		if (!reactFlowInstance) return;
		reactFlowInstance.fitView();	
	}, [ reactFlowInstance ])

	const createBrick = (lib, func, position = { x: 0, y: 0 }) => {
		setNodes(nds => {
			let id = getNextNodeId(nds);
			const newNode = {
				id,
				type: 'brick',
				position,
				dragHandle: '.brick-header',
				data: {
					id: parseInt(id),
					lib, 
					func,
					params: {}
				},
			};
			return nds.concat(newNode)
		});
	}

	const onDragOver = useCallback((event) => {
		event.preventDefault();
		event.dataTransfer.dropEffect = 'move';
	}, []);

	const onDrop = useCallback((event) => {
		event.preventDefault();

		const reactFlowBounds = brickEditorRef.current.getBoundingClientRect();
		const jsonBrick = event.dataTransfer.getData('application/reactflow');
		// check if the dropped element is valid
		if (typeof jsonBrick === 'undefined' || !jsonBrick) return;
		let brick = JSON.parse(jsonBrick);
		const position = reactFlowInstance.project({
			x: event.clientX - reactFlowBounds.left,
			y: event.clientY - reactFlowBounds.top,
		});
		createBrick(brick.lib, brick.func, position)
	}, [ reactFlowInstance ]);

	// onChange
	useEffect(() => {
		if (!props.onChange) return;
		let bricks = {};
		for (let node of nodes) {
			let brick = node.data;
			bricks[node.id] = brick;
			brick.position = node.position;
		}
		for (let edge of edges) {
			let paramCode = edge.data.paramCode;
			let targetBrick = bricks[edge.target];
			if (!targetBrick) {
				continue;
			}
			let brick = bricks[edge.source];
			brick.params[paramCode] = { 
				brickId: targetBrick.id
			};
		}
		props.onChange(Object.values(bricks))
	}, [ nodes, edges, props.onChange ])


	return (
		<div
			className="brick-editor"
			style={{ width, height }}
			ref={brickEditorRef}
		>
		<ReactFlow
			onDragOver={onDragOver}
			onDrop={onDrop}
			nodeTypes={nodeTypes}
			nodes={nodes}
			edges={edges}
			nodesDraggable
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onEdgeUpdate={onEdgeUpdate}
			onEdgeUpdateStart={onEdgeUpdateStart}
			onEdgeUpdateEnd={onEdgeUpdateEnd}
			multiSelectionKeyCode={multiSelectionKeys}
			onInit={setReactFlowInstance}
			nodesConnectable
			fitView
		>
			<Panel position='top-left'>
				<BrickPanel/>
			</Panel>
			<Panel position='top-right'>
				<Button onClick={() => layout()}>Layout</Button>
			</Panel>
			<Background />
		</ReactFlow>
		{/*<BrickSelector position={brickSelectorPosition} onSelected={onBrickSelected} brickLibrary={props.brickLibrary}/>*/}
		</div>
	);
};

export default BrickEditor;
