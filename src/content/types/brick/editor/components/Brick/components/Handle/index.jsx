import { useBrickLibrary } from 'contexts/brickLibrary';
import { useBrick } from '../../contexts/brick';
import { Handle, useReactFlow } from 'reactflow';
import { useCallback } from 'react';
import { createEdge } from '../../../../utils';

import './style.scss';

const isValidParamConnection = (connection, brickLibrary, reactFlowInstance) => {
	let existentEdge = reactFlowInstance.getEdge(`${connection.source}.${connection.sourceHandle}`);
	if (existentEdge) return false;
	if (connection.target === connection.source) return;
	let targetBrick = reactFlowInstance.getNode(connection.target).data;
	let sourceBrick = reactFlowInstance.getNode(connection.source).data;
	let sourceSignature = brickLibrary.getBrick(sourceBrick.lib, sourceBrick.func);

	let [ paramCode, ...path ] = connection.sourceHandle.split('.');

	let param = sourceSignature.params.find(p => p.code === paramCode);
	if (!param) return false;
	let valueType = param.type.valueType
	let validBrickType = valueType ? valueType.brickType : param.type.brickType;
	return validBrickType === targetBrick.lib;
}

const BrickHandle = (props) => {
	let { id, inverted, type, position, brickType, connectionValidator, style } = props;
	const { brick } = useBrick();
	const reactFlowInstance = useReactFlow();

	const getEdgeId = (connection) => `${connection.source}.${connection.sourceHandle}`;

	const onConnect = (connection) => {
		console.log(connection)
		let targetNode = reactFlowInstance.getNode(connection.target);
		let isPipeline = targetNode.data.lib === 'action';
		let edgeParams = createEdge(connection.source, connection.target, connection.sourceHandle, isPipeline);
  		console.log(edgeParams)
		reactFlowInstance.addEdges(edgeParams);
	}

	const isValidConnection = (connection) => {
		let edgeId = getEdgeId(connection);
		let existentEdge = reactFlowInstance.getEdge(`${connection.source}.${connection.sourceHandle}`);
		console.log('isValidConnection', existentEdge)
		if (existentEdge) return false;
		if (connectionValidator) {
			return connectionValidator(connection);
		}
		return true;
	}

	return <Handle
		id={id}
		type={type}
		position={position}
		onConnect={onConnect}
		isConnectable
		style={style}
		isValidConnection={(connection) => isValidConnection(connection)}
		className={`brick-handle ${position}`}
	/>
}

export function ParamHandle(props) {
	const { param, side } = props;
	const { brickLibrary } = useBrickLibrary();
	const reactFlowInstance = useReactFlow();

	const connectionValidator = useCallback((connection) => {
		if (connection.target === connection.source) return;
		let targetBrick = reactFlowInstance.getNode(connection.target).data;
		let sourceBrick = reactFlowInstance.getNode(connection.source).data;
		let sourceSignature = brickLibrary.getBrick(sourceBrick.lib, sourceBrick.func);

		let [ paramCode, ...path ] = connection.sourceHandle.split('.');

		let param = sourceSignature.params.find(p => p.code === paramCode);
		if (!param) return false;
		let valueType = param.type.valueType
		let validBrickType = valueType ? valueType.brickType : param.type.brickType;
		return validBrickType === targetBrick.lib;
	})

	return <BrickHandle 
		id={param.code} 
		brickType={param.type.brickType} 
		type='source'
		style={{ backgroundColor: brickLibrary.getTypeColor(param.type.brickType) }}
		position={side}
	/>
}

export function OutputHandle(props) {
	const { side } = props;
	const { brick } = useBrick();
	const { brickLibrary } = useBrickLibrary();

	return <div className='brick-output'>		
		<BrickHandle 
			id={'_out'} 
			brickType={brick.lib} 
			type='target'
			style={{ backgroundColor: brickLibrary.getTypeColor(brick.lib) }}	
			position={side}
		/>
	</div>
}

