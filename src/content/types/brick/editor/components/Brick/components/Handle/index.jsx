import { useBrickLibrary } from 'contexts/brickLibrary';
import { useBrick } from '../../contexts/brick';
import { Handle as ReactFlowHandle, useReactFlow, useEdges } from 'reactflow';
import { useCallback, useMemo, useEffect, useState } from 'react';
import { createEdge } from '../../../../utils';
import { v4 as uuid } from 'uuid';

import './style.scss';

export function Handle(props) {
	const { brick } = useBrick();
	const { id, side, color } = props;
	const reactFlowInstance = useReactFlow();
	const { brickLibrary } = useBrickLibrary();
	const edges = useEdges();

	const type = props.type ?? 'source';
	const edge = useMemo(() => {
		let handleType = `${type}Handle`;
		return edges.find(edge => edge[type] === `${brick.id}` && edge[handleType] === id);
	}, [ edges, id ]);
	const [ connected, setConnected ] = useState(!!edge);

	useEffect(() => {
		if (!edge && connected) {
			if (props.onDisconnect) props.onDisconnect();
			setConnected(false);
			return;
		}
		if (edge && !connected) {
			if (props.onConnect) props.onConnect(edge);
			setConnected(true);
			return;
		}
	}, [ edge, connected, props.onConnect, props.onDisconnect ])

	if (connected) {
		var style = { backgroundColor: color }
	} else {
		var style = { border: `solid 4px ${color}` }
	}
	const isValidConnection = (connection) => {
		if (connection.target === connection.source) return;
		let sourceBrick = reactFlowInstance.getNode(connection.source).data;
		let targetBrick = reactFlowInstance.getNode(connection.target).data;
		let sourceSignature = brickLibrary.getBrick(sourceBrick.lib, sourceBrick.func);
		let [ paramCode ] = connection.sourceHandle.split('.');
		let param = sourceSignature.params.find(p => p.code === paramCode);
		if (param.type.valueType) {
			var brickType = param.type.valueType.brickType;
		} else {
			var brickType = param.type.brickType;
		}
		if (brickType !== targetBrick.lib) return;
		if (props.isValidConnection) {
			return props.isValidConnection(connection);
		}
		return true;
	}

	const onConnect = (connection) => {
		const [ paramCode, index ] = connection.sourceHandle.split('.');
		let edgeId = index === undefined  ? `${paramCode}` : `${paramCode}.${uuid()}`;
		let newEdge = createEdge(connection.source, connection.target, paramCode, index);
		let oldEdge = reactFlowInstance.getEdges().find(edge => edge.source === connection.source && edge.sourceHandle === connection.sourceHandle);
		if (oldEdge) {
			reactFlowInstance.deleteElements({ edges: [ oldEdge ]});
		}
		reactFlowInstance.addEdges(newEdge);
	}

	return <div className={`brick-handle-row ${side}`}>
		{props.children}
		<ReactFlowHandle
			id={id}
			type={type}
			position={side}
			onConnect={onConnect}
			style={style}
			isValidConnection={isValidConnection}
			className={`brick-handle ${side}`}
		/>
	</div>
}

export function OutputHandle(props) {
	const { side } = props;
	const { brick } = useBrick();
	const { brickLibrary } = useBrickLibrary();

	const color = useMemo(() => brickLibrary.getTypeColor(brick.lib), [ brickLibrary, brick ]);

	return <Handle
		id='_out'
		type='target'
		color={color}
		side={side}
	/>
}

