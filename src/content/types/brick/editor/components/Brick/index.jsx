import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Handle, useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { Tooltip, Button, Input } from 'antd';
import { useBrickLibrary } from 'contexts/brickLibrary';
import { Header, Params, BrickHandle } from './components'
const { TextArea } = Input;
import { BrickProvider, useBrick } from './contexts/brick';

import './style.scss';

export function Brick(props) {
	const { brickLibrary } = useBrickLibrary();
	const [ brick, setBrick ] = useState(props.data);
	const signature = useMemo(() => brickLibrary.getBrick(brick.lib, brick.func), [ brickLibrary, brick ]);

	let nodeType = 'default';
	if (brick.func === 'arg') nodeType = 'arg';
	if (brick.func === 'root') nodeType = 'root';

	return <BrickProvider 
		brick={brick} 
		signature={signature}
	>
		<div className={`brick ${props.selected ? 'selected' : ''}`}>	
			{nodeType === 'arg' && <ArgBody/>}
			{nodeType === 'root' && <RootBody/>}
			{nodeType === 'default' && <DefaultBody/>}
		</div>
	</BrickProvider>
}

function Body(props) {
	const { brick } = useBrick();
	const { brickLibrary} = useBrickLibrary();

	let backgroundColor = props.color ?? brickLibrary.getTypeColor(brick.lib);

	return <>
		<div className='brick-bg' style={{ backgroundColor }}/>
		<Header title={props.title}/>
		<div className='brick-body'>
			{props.children}
		</div>
	</>;
}

function ErrorBody({ error }) {
	const { brick } = useBrick();

	let nestedParams = [];
	for (let [ paramCode, paramValue ] of Object.entries(brick.params)) {
		if (paramValue.brickId) {
			nestedParams.push(paramCode);
		}
	}
	return <Body title='Error' color='red'>
		<BrickHandle/>
		<div style={{ padding: '3px' }}>{error}</div>
		{nestedParams.map((param, index) => <Handle //TODO: use proper handle
			key={index}
			id={param}
			type={'source'}
			position={'left'}
			style={{ backgroundColor: 'red' }}
			isConnectable={false}
			className='brick-handle input'
		/>)}
	</Body>;
}

function DefaultBody(props) {
	const { brick, signature } = useBrick();
	if (!signature) {
		var error = `Missing brick ${brick.lib}.${brick.func}`;
	}
	
	if (error) return <ErrorBody error={error}/>
	return <Body title={signature.name}>
		<BrickHandle/>
		<Params/>
	</Body>
}

function RootBody() {
	return <Body title='Root'>
		<Params/>
		<div style={{ padding: '3px' }}>I AM ROOT!</div>
	</Body>
}

function ArgBody() {
	const { brick } = useBrick();
	const { brickParams } = useBrickLibrary();

	let argName = brick.params.name;
	if (!brickParams || !brickParams.find(param => param.name === argName)) {
		var error = `Missing ${brick.lib} param [${argName}]`;
	}

	if (error) return <ErrorBody error={error}/>

	return <Body title='Argument1'>
		<BrickHandle/>
		<div style={{ padding: '3px' }}>{argName}</div>
	</Body>;
}

