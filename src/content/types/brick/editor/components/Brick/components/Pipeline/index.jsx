import { useState, useEffect } from 'react'
import { Button } from 'antd'
import { v4 as uuid } from 'uuid';
import { useBrick } from '../../contexts/brick';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { Handle, useReactFlow } from 'reactflow';

import './style.scss';

const PipelineHandle = (props) => {
	let { pipelineName, type } = props;
	const { brick } = useBrick();
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
		return true
		// let existentEdge = reactFlowInstance.getEdge(`${connection.source}.${connection.sourceHandle}`);
		// if (existentEdge) return false;
		// if (connection.target === connection.source) return;
		// let targetBrick = reactFlowInstance.getNode(connection.target).data;
		// let sourceBrick = reactFlowInstance.getNode(connection.source).data;
		// let sourceSignature = brickLibrary.getBrick(sourceBrick.lib, sourceBrick.func);

		// let [ paramCode, index ] = connection.sourceHandle.split('.');

		// let param = sourceSignature.params.find(p => p.code === paramCode);
		// if (!param) return false;
		// let valueType = param.type.valueType
		// let validBrickType = valueType ? valueType.brickType : param.type.brickType;
		// return validBrickType === targetBrick.lib;
	}

	const id = `${pipelineName}.${type}`;
	const className = `brick-handle ${type === 'source' ? 'right' : 'left'}`;

	return <Handle
		id={id}
		type={type}
		position='right'
		onConnect={onConnect}
		style={{ backgroundColor: brickLibrary.getTypeColor(brick.lib) }}
		isValidConnection={isValidConnection}
		className={className}
	/>
};

// import './style.scss'

export function Pipeline(props) {
	const { name } = props;
	const { brick } = useBrick();

	return <div className='brick-pipeline'>
		<div className='pipeline-name'>{name}</div>
		<PipelineHandle pipelineName={name} type={'source'}/>
		{brick.func !== 'root' && <PipelineHandle pipelineName={name} type={'target'}/>}
	</div>
}