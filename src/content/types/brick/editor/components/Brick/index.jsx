import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, useNodesState, applyNodeChanges, useReactFlow } from 'reactflow';
import { Tooltip, Button, Input } from 'antd';
import { CommentOutlined, DashOutlined, CloseOutlined} from '@ant-design/icons';
import { useBrickLibrary } from 'contexts/brickLibrary';
const { TextArea } = Input;
import { v4 as uuid } from 'uuid';

import './style.scss';

export const getBrickLibColor = (lib) => {
	return `var(--brick-color-${lib})`;
}

function BrickName(props) {
	if (props.onDoubleClick) return <Tooltip title='Double click to open'>
		<div onDoubleClick={props.onDoubleClick} className="brick-name custom" style={props.titleStyle}>
			{props.name}
		</div>
	</Tooltip>;
	return <div className="brick-name" style={props.titleStyle}>
		{props.name}
	</div>;
}

function ArrayParam(props) {

}

function InlineParam(props) {
	let { param, brick } = props;
	const reactFlowInstance = useReactFlow();

	const onChangeTmp = (value) => {
		brick.params[param.code] = value;
	}

	return <div className='brick-param'>
		<param.type.valueRender
			defaultValue={brick.params[param.code]}
			onChange={onChangeTmp}
			type={param.type}
		/>
	</div>
}

const BrickHandle = (props) => {
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


function BrickParam(props) {
	let { brick, param } = props;

	return <div className='brick-param'>
		<div>{param.name}</div>
		<BrickHandle brick={brick} param={param}/>
	</div>
}

function Param(props) {
	let { param } = props;
	if (param.type.brickType) return <BrickParam {...props}/>
	return <InlineParam {...props}/>;
}


export function Brick(props) {
	const reactFlowInstance = useReactFlow();
	const { brickLibrary } = useBrickLibrary();
	let brick = props.data;

	const brickSignature = brickLibrary[brick.lib][brick.func];

	const removeBrick = () => {
		console.log(reactFlowInstance.toObject());
		let thisNode = reactFlowInstance.getNode(props.id);
		reactFlowInstance.deleteElements({ nodes: [ thisNode ] });
	}

	let className = 'brick';
	if (props.selected) {
		className += ' selected';
	}
	return (<>
		<div
			className={className}
			style={{ backgroundColor: getBrickLibColor(brickSignature.lib)}}
		>
			<div className='brick-header'>
				<BrickName name={brickSignature.name}/>
				<Button size='small' className='remove-button' onClick={removeBrick}>
					<CloseOutlined/>
				</Button>
			</div>
			<div className='brick-body'>
				<BrickHandle brick={brick}/>
				{brickSignature.params.map((param, index) => <Param 
					key={index} 
					brick={brick}
					param={param}
				/>)}
			</div>
		</div>
	</>);
}
