import { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, { 
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
import { BrickSelector } from './components/BrickSelector';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { v4 as uuid } from 'uuid';
import { getLayoutedElements } from './layout';

import dagre from 'dagre';

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


export const BrickEditor = (props) => {
  const { brickLibrary } = useBrickLibrary();
	let width = props.fullscreen ? window.innerWidth : 300;
	let height = props.fullscreen ? window.innerHeight : 200;

	const [nodes, setNodes, onNodesChange] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();
  const edgeUpdateSuccessful = useRef(true);

	const fit = useRef(false)
	const reactFlowInstance = useRef(false);

	const [ brickSelectorPosition, setBrickSelectorPosition ] = useState();

	useEffect(() => {
		if (!props.brickLibrary || !props.brickTree) return;
		let newFormat = convertToNewFormat(props.brickTree);
		let elements = buildElements(newFormat);
		setNodes(elements.nodes);
		setEdges(elements.edges);
	}, [ brickLibrary, props.brickTree ])

	const onInit = (instance) => {
		reactFlowInstance.current = instance;
	}

	const layout = () => {
		let layouted = getLayoutedElements(nodes, edges);
		fit.current = true;
		setNodes(layouted.nodes);
		setEdges(layouted.edges);
	}
	
  const onEdgeUpdateStart = useCallback(() => {
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

  const onConnect = useCallback((params) => {
  	console.log(params)
  	setEdges((els) => addEdge(params, els)), []
  });

	useEffect(() => {
		if (fit.current) {
			fit.current = false;
			if (reactFlowInstance.current) {
				reactFlowInstance.current.fitView()
			}
		}
	}, [ nodes ])


	const onPaneContextMenu = (event) => {
		event.preventDefault();
		setBrickSelectorPosition({
			x: event.pageX,
			y: event.pageY,
		})
	}

	const createBrick = (lib, func, position = { x: 0, y: 0 }) => {
		let id = uuid();
		let brick = {
			id,
			lib, 
			func,
			params: {}
		}
		const newNode = {
			id,
			type: 'brick',
			position,
			data: brick,
		};
		setNodes(nds => nds.concat(newNode));
	}

	const onBrickSelected = (brick) => {
		if (brick) {
			console.log('SELECTED: ', brick.lib, brick.func);
			createBrick(brick.lib, brick.func, brickSelectorPosition);
		}
		setBrickSelectorPosition();
	}

	useEffect(() => {
		console.log('NODES & EDGES', nodes, edges);
		// TODO: generate
	}, [ nodes, edges ])

	return (
		<div
			className="brick-editor"
			style={{
				width,
				height,
			}}
		>
		<Button onClick={() => layout()}>LAY</Button>
		<ReactFlow
			nodeTypes={nodeTypes}
			nodes={nodes}
			edges={edges}
			nodesDraggable
			onNodesChange={onNodesChange}
			onEdgesChange={onEdgesChange}
			onEdgeUpdate={onEdgeUpdate}
      onEdgeUpdateStart={onEdgeUpdateStart}
      onEdgeUpdateEnd={onEdgeUpdateEnd}
      onPaneContextMenu={onPaneContextMenu}
			onConnect={onConnect}
			nodesConnectable
			onInit={onInit}
			fitView
		>
			<Background />
		</ReactFlow>
		<BrickSelector position={brickSelectorPosition} onSelected={onBrickSelected} brickLibrary={props.brickLibrary}/>
		</div>
	);
};

export default BrickEditor;
