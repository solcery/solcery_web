import { useBrickLibrary } from 'contexts/brickLibrary';
import { Handle, useReactFlow } from 'reactflow';

import './style.scss';

export const getBrickLibColor = (lib) => {
	return `var(--brick-color-${lib})`;
}

export const BrickHandle = (props) => {
	let { brick, param } = props;
	const reactFlowInstance = useReactFlow();
	const { brickLibrary } = useBrickLibrary();

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
		let targetBrick = reactFlowInstance.getNode(connection.target).data;
		let sourceBrick = reactFlowInstance.getNode(connection.source).data;
		let sourceSignature = brickLibrary[sourceBrick.lib][sourceBrick.func];
		let param = sourceSignature.params.find(p => p.code === connection.sourceHandle);
		if (!param) return false;
		return param.type.brickType === targetBrick.lib;
	}

	return <Handle
		id={param ? `${param.code}` : 'output'}
		type={param ? 'source' : 'target'}
		position={ param ? 'left' : 'right' }
		style={{ background: getBrickLibColor(param ? param.type.brickType : brick.lib) }}
		onConnect={onConnect}
		isValidConnection={isValidConnection}
		isConnectable
		className={`brick-handle ${param ? 'input' : 'output'}`}
	/>
}
