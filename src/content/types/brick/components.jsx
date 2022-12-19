import { BrickEditor } from './editor/BrickEditor';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { BrickLibrary } from '../../brickLib/brickLibrary';
import { Button, Select, Popover, Input } from 'antd';
import { SType } from '../index';
import { insertTable } from '../../../utils';
import { BrickLibraryProvider, useBrickLibrary } from 'contexts/brickLibrary';
import { BrickParamsProvider } from 'contexts/brickParams';
import { useContent } from 'contexts/content';
import { useUser } from 'contexts/user';
import { v4 as uuid } from 'uuid';

import './style.scss';

const { Option } = Select;

function BrickTree(props) {
	const [ mode, setMode ] = useState('small');

	var wrapperProps = {
		className: `brick-editor-${mode}`,
	}
	var brickEditorProps = {
		key: mode,
		brickTree: props.defaultValue,
		brickType: props.brickType,
	}

	if (mode === 'fullscreen') {
		wrapperProps.style = {
			width: window.innerWidth, 
			height: window.innerHeight
		}
		brickEditorProps.onExit = () => setMode('small');
		if (props.onChange) {
			brickEditorProps.onSave = (value) => {
				setMode('small');
				if (!props.onChange) return;
				let saved = value;
				if (saved && saved.length <= 1) { // Root only means empty graph
					saved = undefined;
				}
				props.onChange(saved)
			}
		}
	} else {
		wrapperProps.onClick = () => setMode('fullscreen');
	}

	return <div {...wrapperProps}>
		{mode === 'small' && <div className='highlight-fullscreen'>
			CLICK TO OPEN
		</div>}
		<ReactFlowProvider>
			<BrickEditor {...brickEditorProps}/>
		</ReactFlowProvider>
	</div>;
}

function BrickTypeSelector(props) {
	const { brickLibrary } = useBrickLibrary();

	if (!brickLibrary) return;

	const onChange = (value) => {
		props.onChange(value)
	}
	const options = brickLibrary.getTypes();

	return <Select 
		defaultValue={props.defaultValue} 
		onChange={onChange} 
		placeholder='Select brick type...' 
		className='brick-type-selector'
	>
		{options.map(brickType => <Option key={brickType.code} value={brickType.code}>
			<div className='brick-type-option'style={{ backgroundColor: brickType.color }}>{brickType.name}</div>
		</Option>)}
	</Select>
}

function ParamSignature(props) {
	const [ param, setParam ] = useState(props.defaultValue ?? {})

	const onParamChanged = (prop, value) => {
		param[prop] = value;
		if (!props.onChange) return;
		props.onChange(param);
	}

	return <div style = {{ display: 'flex' }}>
		Name: <Input 
			onChange={event => onParamChanged('name', event.target.value)}
			style={{ width: 200 }}
			defaultValue={param.name}
		/>
		Type: <BrickTypeSelector
			onChange={value => onParamChanged('type', value)}
			defaultValue={param.type}
		/>
	</div>
}

function ArrayComponent(props) {

	const [ items, setItems ] = useState(props.defaultValue ?? []);
	const [ itemUuids, setItemUuids ] = useState(); 

	useEffect(() => {
		setItemUuids(items.map(item => uuid()));
	}, [ items ])

	const update = (items) => {
		if (!props.onChange) return;
		props.onChange(items);
	}

	const onItemChanged = (uuid, value) => {
		let index = itemUuids.find(item => item === uuid);
		if (index < 0) return;
		items[index] = value;
		update(items)
	}

	const onItemRemoved = (uuid) => {
		let index = itemUuids.find(item => item === uuid);
		if (index < 0) return;
		items.splice(index, 1);
		itemUuids.splice(index, 1);
		setItemUuids([...itemUuids])
		update(items)
	};

	const onItemAdded = () => {
		items.push({});
		itemUuids.push(uuid());
		setItemUuids([...itemUuids])
		update(items);
	};

	if (!itemUuids) return;
	return <div className={props.className} style={props.style}>
		{itemUuids.map((uuid, index) => <div key={uuid}>
			<Button onClick={() => onItemRemoved(uuid)}>-</Button>
			<props.itemComponent 
				defaultValue={items[index]}
				onChange={(value) => onItemChanged(uuid, value)} 
			/>
		</div>)}
		<Button onClick={() => onItemAdded()}>+</Button>
	</div>
}

function ParamsSelector(props) {

	const onChange = (value) => {
		if (!props.onChange) return;
		if (!value) {
			props.onChange(value);
			return;
		}
		props.onChange(value.filter(v => v.name && v.type));
	}

	return <ArrayComponent 
		className='brick-params-selector'
		defaultValue={props.defaultValue}
		itemComponent={ParamSignature}
		onChange={onChange}
	/>
	// return <div className='brick-params-selector'>
	// 	{Object.entries(data).map(([ uuid, param ]) => <div style={{ display: 'flex' }} key={uuid}>
	// 		<Button onClick={() => removeElement(uuid)}>-</Button>
	// 		<ParamSignature 
	// 			onChange={(value) => onParamChanged(uuid, value)}
	// 			defaultValue={param}
	// 		/>
	// 	</div>)}
	// 	<Button onClick={addNewElement}>+</Button>
	// </div>
}

export function ValueRender(props) {

	const getBrickType = (nodes) => {
		if (!nodes) return;
		let rootNode = nodes.find(node => node.func === 'root');
		if (!rootNode) return;
		return rootNode.lib;
	}

	let defaultValue = props.defaultValue ?? {};
	const [ nodes, setNodes ] = useState(defaultValue.nodes);
	const [ params, setParams ] = useState(defaultValue.params);
	const [ brickType, setBrickType ] = useState(props.type.brickType ?? getBrickType(nodes));

	const [ brickLibrary, setBrickLibrary ] = useState();
	const { content } = useContent();

	const onChange = (nodes, params) => {
		if (!props.onChange) return;
		props.onChange({ nodes, params })
	}

	const onParamsChanged = useCallback((params) => {
		setParams(params);
		onChange(nodes, params)
	}, [ nodes ])

	const onNodesChanged = useCallback((nodes) => {
		setNodes(nodes);
		onChange(nodes, params)
	}, [ params ]);

	useEffect(() => {
		if (!content) return;
		let bl = new BrickLibrary();
		bl.addCustomBricks(content);
		setBrickLibrary(bl)
	}, [ content ]);

	if (!brickLibrary) return;

	return <BrickLibraryProvider brickLibrary={brickLibrary} brickParams={params}>
		{props.type.params && <ParamsSelector defaultValue={params} onChange={onParamsChanged}/>}
		{!brickType && <BrickTypeSelector onChange={setBrickType}/>}
		{brickType && <BrickTree
			defaultValue={nodes}
			onChange={onNodesChanged}
			brickType={brickType}
		/>}
	</BrickLibraryProvider>
}

export const BrickTreeEditor = (props) => {

};

export const FilterRender = (props) => {
	let defaultValue = props.defaultValue ?? 'action';
	const titles = {
		action: 'Action',
		condition: 'Condition',
		value: 'Value',
	};
	if (!props.onChange) return <>{titles[defaultValue]}</>;
	return (
		<Select style={{ minWidth: '100px' }} onChange={props.onChange} defaultValue={props.defaultValue}>
			<Option value="action">{titles.action}</Option>
			<Option value="condition">{titles.condition}</Option>
			<Option value="value">{titles.value}</Option>
		</Select>
	);
};
