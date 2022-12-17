import { useBrickLibrary } from 'contexts/brickLibrary';
import { Handle, useReactFlow } from 'reactflow';

import './style.scss';

export const BrickHandle = (props) => {
	let { param, index, brick, uuid } = props;
	const reactFlowInstance = useReactFlow();
	const { brickLibrary, getBrickTypeStyle } = useBrickLibrary();
	const isOutput = !param;

	const onConnect = (connection) => {
  		let edgeParams = {
		  	id: `${connection.source}.${connection.sourceHandle}`,
		  	...connection,
		  	data: {
		  		paramCode: connection.sourceHandle,
		  	}
		}
		reactFlowInstance.addEdges(edgeParams);
	}

	const isValidConnection = (connection) => {
		let existentEdge = reactFlowInstance.getEdge(`${connection.source}.${connection.sourceHandle}`);
		if (existentEdge) return false;
		if (connection.target === connection.source) return;
		let targetBrick = reactFlowInstance.getNode(connection.target).data;
		let sourceBrick = reactFlowInstance.getNode(connection.source).data;
		let sourceSignature = brickLibrary[sourceBrick.lib][sourceBrick.func];

		let [ paramCode, index ] = connection.sourceHandle.split('.');

		let param = sourceSignature.params.find(p => p.code === paramCode);
		if (!param) return false;
		let valueType = param.type.valueType
		let validBrickType = valueType ? valueType.brickType : param.type.brickType;
		return validBrickType === targetBrick.lib;
	}

	let handleId = 'output';
	let type = brick.lib;
	if (param) {
		handleId = param.code;
		type = param.type.brickType;
		if (uuid) {
			type = param.type.valueType.brickType;
			handleId += `.${uuid}`;
		}
	}

	return <Handle
		id={handleId}
		type={isOutput ? 'target': 'source'}
		position={isOutput ? 'right' : 'left'}
		onConnect={onConnect}
		style={getBrickTypeStyle(type)}
		isValidConnection={isValidConnection}
		isConnectable
		className={`brick-handle ${isOutput ? 'output' : 'input'}`}
	/>
}
