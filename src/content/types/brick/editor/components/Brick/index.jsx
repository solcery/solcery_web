import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Handle, useReactFlow } from 'reactflow';
import { Tooltip, Button, Input } from 'antd';
import { CommentOutlined, DashOutlined, CloseOutlined} from '@ant-design/icons';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { BrickHandle } from '../BrickHandle';
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

	return <div className='brick-param-inline'>
		<div  className='brick-param-name'>{param.name}</div>
		<div className='brick-param-value'>
			<param.type.valueRender
				defaultValue={brick.params[param.code]}
				onChange={onChangeTmp}
				type={param.type}
			/>
		</div>
	</div>
}



function BrickParam(props) {
	let { brick, param } = props;

	return <div className='brick-param-brick'>
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
		let thisNode = reactFlowInstance.getNode(props.id);
		reactFlowInstance.deleteElements({ nodes: [ thisNode ] });
	}

	let className = 'brick';
	if (props.selected) {
		className += ' selected';
	}
	return (<>
		<div className={className}>	
			<div className='brick-bg' style={{ backgroundColor: getBrickLibColor(brickSignature.lib)}}/>
			<div className='brick-header'>
				<BrickName name={brickSignature.name}/>
				{brickSignature.func !== 'root' && <Button size='small' className='remove-button' onClick={removeBrick}>
					<CloseOutlined/>
				</Button>}
			</div>
			<div className='brick-body'>
				{brickSignature.func !== 'root' && <BrickHandle brick={brick}/>}
				{brickSignature.params.map((param, index) => <Param 
					key={index} 
					brick={brick}
					param={param}
				/>)}
			</div>
		</div>
	</>);
}
