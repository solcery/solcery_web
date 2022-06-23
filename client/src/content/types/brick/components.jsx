import { BrickEditor } from './editor/BrickEditor';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useState, useEffect } from 'react';
import { paramFromMapEntry } from '../../brickLib';
import { Select, Button } from 'antd';
import { SType } from '../base';
import { insertTable } from '../../../utils';
import { useBrickLibrary } from '../../../contexts/brickLibrary';
import { useUser } from '../../../contexts/user';

const { Option } = Select;

const BrickTypeEditor = (props) => {
	if (props.defaultValue) return <></>;
	return (
		<Select onChange={props.onChange} defaultValue={props.defaultValue}>
			<Option key="action" value="action">
				Action
			</Option>
			<Option key="condition" value="condition">
				Condition
			</Option>
			<Option key="value" value="value">
				Value
			</Option>
		</Select>
	);
};

const paramMapType = SType.from({
	name: 'SMap',
	data: {
		keyType: 'SString',
		valueType: {
			name: 'SEnum',
			data: {
				values: ['action', 'condition', 'value'],
				titles: ['Action', 'Condition', 'Value'],
			},
		},
	},
});

const argFromParam = (param) => {
	return {
		lib: param.type.brickType,
		func: `arg`,
		name: `Arg [${param.name}]`,
		params: [
			{
				code: 'name',
				name: 'Name',
				type: SType.from('SString'),
				value: param.code,
				readonly: true,
			},
		],
	};
};

const BrickParamsEditor = (props) => {
	const [value, setValue] = useState(props.defaultValue);
	const [editMode, setEditMode] = useState(false);

	const apply = () => {
		setEditMode(false);
		props.onChange([...value]);
	};

	return (
		<>
			<paramMapType.valueRender defaultValue={value} type={paramMapType} onChange={editMode && setValue} />
			{!props.readonly && !editMode && <Button onClick={() => setEditMode(!editMode)}>Edit params</Button>}
			{editMode && <Button onClick={apply}>Apply</Button>}
		</>
	);
};

export const ValueRender = (props) => {
	const { readonlyBricks } = useUser();

	const [brickType, setBrickType] = useState(
		props.type.brickType ? props.type.brickType : props.defaultValue && props.defaultValue.brickType
	);
	const [brickParams, setBrickParams] = useState(props.defaultValue ? props.defaultValue.brickParams : []);
	const [brickTree, setBrickTree] = useState(props.defaultValue && props.defaultValue.brickTree);

	useEffect(() => {
		props.onChange && props.onChange({ brickType, brickParams, brickTree });
	}, [brickType, brickParams, brickTree, props]);

	if (!props.onChange && (!props.defaultValue || !props.defaultValue.brickTree)) return <p>Empty</p>;
	if (!readonlyBricks && !props.onChange) return <p>Brick</p>;
	return (
		<>
			{!brickType && <BrickTypeEditor defaultValue={brickType} onChange={setBrickType} />}
			{props.type.params && <BrickParamsEditor readonly={!props.onChange} defaultValue={brickParams} onChange={setBrickParams} />}
			{brickType && (
				<BrickTreeEditor
					brickParams={brickParams}
					brickTree={brickTree}
					brickType={brickType}
					onChange={props.onChange && setBrickTree}
					objectId={props.objectId}
					templateCode={props.templateCode}
					fieldCode={props.fieldCode}
				/>
			)}
		</>
	);
};

export const BrickTreeEditor = (props) => {
	const [ownBrickLibrary, setOwnBrickLibrary] = useState();
	const { brickLibrary } = useBrickLibrary();

	const mapParams = (paramsArray) => {
		let bricks = {};
		paramsArray
			.filter((entry) => entry.key !== '')
			.map((entry) => paramFromMapEntry(entry))
			.forEach((param) => {
				let arg = argFromParam(param);
				let argCode = arg.params[0].value;
				insertTable(bricks, arg, arg.lib, `arg.${argCode}`);
			});
		return bricks;
	};

	useEffect(() => {
		if (!brickLibrary || !props.brickParams) return;
		let bricks = {};

		Object.entries(brickLibrary).forEach(([lib, libBricks]) =>
			Object.entries(libBricks).forEach(([brickFunc, brick]) => insertTable(bricks, brick, lib, brickFunc))
		);

		let paramsLibrary = mapParams(props.brickParams);
		Object.entries(paramsLibrary).forEach(([lib, libBricks]) =>
			Object.entries(libBricks).forEach(([brickFunc, brick]) => insertTable(bricks, brick, lib, brickFunc))
		);
		setOwnBrickLibrary(bricks);
	}, [brickLibrary, props.brickParams]);

	const openInNewTab = () => {
		if (props.fullscreen) return;
		let opn = window.open(`brickEditor.${props.templateCode}.${props.objectId}.${props.fieldCode}?mode=edit`, '_blank', props.onChange ? undefined : 'noopener');
		window.requestData = () => {
			if (opn.loadData) {
				opn.loadData(props)
			}
		}
		window.onApply = (brickTree) => {
			props.onChange(brickTree)
			opn.close();
		}
	};

	if (!ownBrickLibrary) return <>Loading...</>;
	return (
		<>
			<div onClick={openInNewTab}> 
				<ReactFlowProvider>
					<BrickEditor
						fullscreen = {props.fullscreen}
						width={300}
						height={200}
						brickLibrary={ownBrickLibrary}
						brickTree={props.brickTree}
						brickType={props.brickType}
						onChange={props.onChange}
					/>
				</ReactFlowProvider>
			</div> 
		</>
	);
};

export const FilterRender = (props) => {
	const [value, setValue] = useState(props.defaultValue ?? 'action');

	return (
		<div>
			<Select defaultValue={value} onChange={setValue}>
				<Option key="action" value="action">
					Action
				</Option>
				<Option key="condition" value="condition">
					Condition
				</Option>
				<Option key="value" value="value">
					Value
				</Option>
			</Select>
			<Button onClick={() => props.onChange(value)}>APPLY</Button>
			<Button onClick={() => props.onChange()}>CLEAR</Button>
		</div>
	);
};
