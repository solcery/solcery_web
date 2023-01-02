import { useReactFlow, useEdges } from 'reactflow';
import { Handle } from '../Handle';
import { useState, useEffect, useMemo } from 'react'
import { Button, Input } from 'antd'
import { v4 as uuid } from 'uuid';
import { useBrick } from '../../contexts/brick';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { ArrayComponent } from 'components/ArrayComponent';
import { createEdge } from '../../../../utils';
import { FieldRender } from 'content/types';

import { useDocument } from 'contexts/document';

import './style.scss'

function BrickHandle(props) { // Handle for brick-type params
	const { brick } = useBrick();
	let { id, brickType, side, title, required, defaultable, onChange, defaultValue } = props;
	const { brickLibrary } = useBrickLibrary();
	const reactFlowInstance = useReactFlow();
	const [ value, setValue ] = useState(defaultValue); // undefined || { brickId } || { lib: }

	const color = useMemo(() => brickLibrary.getTypeColor(brickType), [ brickLibrary, brickType ]);

	const onDisconnect = () => {
		let defaultBrick = brickLibrary.default(brickType);
		setValue(defaultBrick);
		onChange(defaultBrick)
	}

	const onConnect = (connection) => {
		let brickId = parseInt(connection.target);
		setValue({ brickId })
		onChange({ brickId }, connection)
	}

	if (title) {
		if (value === undefined) {
			if (required && !defaultable) {
				var style = { color: 'red' }
			}
		} else if (value.brickId) {
			var style = { color: 'white' }	
		}
	}

	if (!value && required) {
		console.log('ALARM')
		onDisconnect();
		return;
	}
 	return <Handle 
		id={id} 
		side={side} 
		onConnect={onConnect} 
		onDisconnect={onDisconnect}
		color={color}
	>
		{title && <div className={`param-name ${side}`} style={style}>{title}</div>}
		{required && defaultable && !value.brickId && <InlineBrick 
			brick={value} 
			onChange={props.onChange}
		/>}
	</Handle>
}

function BrickArrayParam(props) {
	const { brick } = useBrick();
	let { param, defaultValue, side } = props;
	const brickType = param.type.valueType.brickType;
	const reactFlowInstance = useReactFlow();
	const { brickLibrary } = useBrickLibrary();
	const [ value, setValue ] = useState(defaultValue ? [...defaultValue] : []);

	const updateValue = (newValue) => {
		props.onChange(value);	
		setValue(newValue);
	}

	const onItemChanged = (index, v) => {
		value[index] = v;
		updateValue([...value]);
	}

	const onItemRemoved = (index) => {
		let edges = reactFlowInstance.getEdges();
		edges = edges.filter(edge => edge.source !== `${brick.id}` || edge.sourceHandle !== `${param.code}.${index}`);
		for (let i = index; i < value.length; i++) {
			let edge = edges.find(edge => edge.source === `${brick.id}` && edge.sourceHandle === `${param.code}.${i}`);
			if (!edge) continue;
			edge.sourceHandle = `${param.code}.${i-1}`;
		}
		reactFlowInstance.setEdges(edges);
		value.splice(index, 1);
		updateValue([...value]);
	}

	const onItemAdded = () => {
		let defaultBrick = brickLibrary.default(brickType);
		updateValue(value.concat(defaultBrick))
	};

	const elementProps = (index) => {
		return {
			id: `${param.code}.${index}`,
			brickType,
			side: side,
			paramCode: param.code,
			title: `${param.name} ${index}`,
			required: true,
			defaultable: true,
			defaultValue: value[index],
			onChange: value => onItemChanged(index, value),
		}
	};

	return <ArrayComponent
		quantity={value.length}
		elementProps={elementProps}
		onItemRemoved={onItemRemoved}
		onItemAdded={onItemAdded}
		ItemComponent={BrickHandle}
		style={{ pointerEvents: 'all' }}
	/>
}

function InlineBrick(props) { // Default brick constructor for defaultable params
	const { brick, onChange } = props;
	const { brickLibrary } = useBrickLibrary();

	const onChangeParam = (paramCode, value) => {
		brick.params[paramCode] = value;
		props.onChange(brick);
	}

	const signature = brickLibrary.getBrick(brick.lib, brick.func);
	return <>
		{signature.params.filter(param => !param.optional).map(param => <div 
			key={param.code} 
			style={{ pointerEvents: 'all' }}
		>
			<FieldRender
				defaultValue={brick.params[param.code]}
				onChange={(value) => onChangeParam(param.code, value)}
				type={param.type}
			/>
		</div>)}
	</>
}

function BrickParam(props) { // Param, which is a brick
	let { param, side, defaultValue } = props;

	return <BrickHandle 
		id={param.code} 
		brickType={param.type.brickType}
		defaultValue={defaultValue}
		side={side} 
		paramCode={param.code}
		onChange={props.onChange}
		title={param.name}
		required={!param.optional}
		defaultable={!param.noDefault}
	/>
}

function InlineParam(props) { // Param, which is not a brick
	const { param } = props;
	const { brick } = useBrick();
	const reactFlowInstance = useReactFlow();

	return <div className='brick-param-inline'>
		<div className='param-name'>{param.name}</div>
		<div className='param-value'>
			<FieldRender
				defaultValue={brick.params[param.code]}
				onChange={!param.readonly ? props.onChange : undefined}
				type={param.type}
			/>
		</div>
	</div>
}

export function Param(props) {
	let { param } = props;
	const { brick } = useBrick();

	const onChange = (value) => {
		brick.params[param.code] = value;
	}

	let ParamComponent = InlineParam;
	if (param.type.brickType) ParamComponent = BrickParam;
	if (param.type.valueType && param.type.valueType.brickType) ParamComponent = BrickArrayParam;

	return <ParamComponent 
		side={props.side}
		onChange={onChange}
		param={param}
		defaultValue={brick.params[param.code]}
	/>;
}

export function Params() {
	const { signature, brick } = useBrick();
	if (!signature) return;
	return <>
		{signature.params.map((param, index) => <Param 
			key={index} 
			brick={brick}
			param={param}
		/>)}
	</>
}