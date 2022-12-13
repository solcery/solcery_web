import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, useNodesState, applyNodeChanges, useReactFlow } from 'reactflow';
import { Tooltip, Button, Input } from 'antd';
import { CommentOutlined, DashOutlined, CloseOutlined} from '@ant-design/icons';
import { useBrickLibrary } from 'contexts/brickLibrary';
const { TextArea } = Input;

import './style.scss';

const getBrickLibColor = (lib) => {
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

function BrickParam(props) {
	let { param, brick } = props;

	const handleStyle = {
		top: '50%',
		position: 'absolute',
		height: '1rem',
		width: '1rem',
		backgroundColor: getBrickLibColor(param.type.brickType),
	}

	const onConnect = (data) => {
		console.log('onConnect', data)
	}

	return <div className='brick-param'>
		<div>{param.name}</div>
		<Handle
			id={`h.${brick.id}.${param.code}`}
			type="source"
			position='left'
			isConnectable
			onConnect={onConnect}
			isValidConnection={() => true}
			style={handleStyle}
		/>
	</div>
}

function Param(props) {
	const { brickLibrary } = useBrickLibrary();

	let { param } = props;
	if (param.type.brickType) return <BrickParam {...props}/>
	return <InlineParam {...props}/>;
}


export function Brick(props) {
	const { brickLibrary } = useBrickLibrary();
	let brick = props.data;
	const reactFlowInstance = useReactFlow();

	const brickSignature = brickLibrary[brick.lib][brick.func];

	const removeBrick = () => {
		let nodes = reactFlowInstance.getNodes();
		let changes = applyNodeChanges([ 
			{ id: props.id, type: 'remove' }, 
		], nodes);
		reactFlowInstance.setNodes(changes);
	}

	return (<>
		<Handle
			type="target"
			position="right"
			style={{ background: '#555' }}
			isConnectable
		/>
		<div
			onClick={() => createBrick('action', 'void')}
			className={`brick`}
			style={{ backgroundColor: getBrickLibColor(brickSignature.lib)}}
		>
			<div className='brick-header'>
				<BrickName name={brickSignature.name}/>
				<Button size='small' className='remove-button' onClick={removeBrick}>
					<CloseOutlined/>
				</Button>
			</div>
			<div className='brick-body'>
				{brickSignature.params.map((param, index) => <Param 
					key={index} 
					brick={brick}
					param={param}
				/>)}
				{/*{inlineParams.map((param) => <param.signature.type.valueRender
					defaultValue={param.value}
					onChange={onChangeTmp}
					type={param.signature.type}
				/>)}
				{nestedParams.map((param, index) => <ParamHandle key={index} brick={data.brick} param={param}/>)}*/}
			</div>
		</div>
	</>);
}
