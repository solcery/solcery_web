import { useReactFlow } from 'reactflow';
import { ParamHandle } from '../Handle';
import { useState, useEffect } from 'react'
import { Button } from 'antd'
import { v4 as uuid } from 'uuid';
import { useBrick } from '../../contexts/brick';

import './style.scss'

function BrickArrayParam(props) {
	const reactFlowInstance = useReactFlow();
	let { param, brick } = props;
	const [ value, setValue ] = useState(brick.params[param.code] ?? []);

	const handleDrop = (droppedItem) => {
		if (!droppedItem.destination) return;
		var updatedList = [...value];
		const [reorderedItem] = updatedList.splice(droppedItem.source.index, 1);
		updatedList.splice(droppedItem.destination.index, 0, reorderedItem);
		setValue(updatedList);
	};

	const addElement = () => {
		setValue(value.concat(uuid()));
	}

	useEffect(() => {
		brick.params[param.code] = value;
	}, [ value ])

	const removeElement = (index) => {
		let uuid = value[index];
		let edge = reactFlowInstance.getEdge(`${brick.id}.${param.code}.${uuid}`);
		if (edge) {
			reactFlowInstance.deleteElements({ edges: [ edge ]})
		}
		let spliced = [...value];
		spliced.splice(index, 1);
		setValue(spliced)
	}	

	return <div style={{pointerEvents: 'all'}}>
		{value.map((uuid, index) => <div key={uuid} className='brick-param-brick'>
			<div className='param-name'>{param.name} [{index}]</div>
			<ParamHandle param={param} pipeline={param.pipeline}/>
			<Button className='delete-button' onClick={() => removeElement(index)}>X</Button>
		</div>)}
		<Button onClick={addElement}>+</Button>
	</div>
}


function BrickParam(props) {
	let { param, side } = props;
	return <div className={`brick-param-brick ${side}`}>
		<div className={`param-name`}>{param.name}</div>
		<ParamHandle param={param} side={side}/>
	</div>
}

function InlineParam(props) {
	const { param } = props;
	const { brick } = useBrick();
	const reactFlowInstance = useReactFlow();

	const onChangeTmp = (value) => {
		brick.params[param.code] = value;
	}

	return <div className='brick-param-inline'>
		<div className='param-name'>{param.name}</div>
		<div className='param-value'>
			<param.type.valueRender
				defaultValue={brick.params[param.code]}
				onChange={!param.readonly ? onChangeTmp : undefined}
				type={param.type}
			/>
		</div>
	</div>
}

export function Param(props) {
	let { param } = props;
	if (param.type.brickType) return <BrickParam {...props}/>
	if (param.type.valueType && param.type.valueType.brickType) return <BrickArrayParam {...props}/>
	return <InlineParam {...props}/>;
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