import { BrickEditor } from './editor';
import { ParamsSelector, BrickTypeSelector } from './params';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useState, useEffect, useCallback } from 'react';
import { BrickLibrary } from '../../brickLib/brickLibrary';
import { Select } from 'antd';
import { BrickLibraryProvider, useBrickLibrary } from 'contexts/brickLibrary';

import { useContent } from 'contexts/content';

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
	return <BrickLibraryProvider 
		brickLibrary={brickLibrary} 
		brickParams={params}
		readonly={!props.onChange}
	>
		{props.type.params && <ParamsSelector 
			defaultValue={params} 
			onChange={props.onChange ? onParamsChanged : undefined}
		/>}
		{!brickType && <BrickTypeSelector onChange={setBrickType}/>}
		{brickType && <BrickTree
			defaultValue={nodes}
			onChange={props.onChange ? onNodesChanged : undefined}
			brickType={brickType}
		/>}
	</BrickLibraryProvider>
}

export const FilterRender = (props) => { // TODO: brickTypeSelector from params
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
