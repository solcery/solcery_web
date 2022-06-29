import { BrickEditor } from './editor/BrickEditor';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useState, useEffect } from 'react';
import { paramFromMapEntry } from '../../brickLib';
import { Select, Button } from 'antd';
import { SType } from '../base';
import { insertTable } from '../../../utils';
import { useBrickLibrary } from '../../../contexts/brickLibrary';
import { useUser } from '../../../contexts/user';
import { useProject } from '../../../contexts/project';

const { Option } = Select;

const BrickTypeEditor = (props) => {
	let defaultValue = props.defaultValue ?? 'action'
	const titles = {
		action: 'Action',
		condition: 'Condition',
		value: 'Value',
	}
	if (!props.onChange) return <>{titles[defaultValue]}</>;
	return (
		<Select style = {{ minWidth: '100px' }} onChange={props.onChange} defaultValue={ props.defaultValue }>
			<Option value='action'>
				{ titles.action }
			</Option>
			<Option value="condition">
				{ titles.condition }
			</Option>
			<Option value="value">
				{ titles.value }
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
	const [brickTree, setBrickTree] = useState(props.defaultValue ? props.defaultValue.brickTree : undefined);

	const onChangeBrickParams = (bp) => {
		props.onChange({ brickType, brickParams: bp, brickTree });
		setBrickParams(bp)
	}

	const onChangeBrickTree = (bt) => {
		props.onChange({ brickType, brickParams, brickTree: bt });
		setBrickTree(bt)
	}

	if (!props.onChange && (!props.defaultValue || !props.defaultValue.brickTree)) return <>Empty</>;
	if (!readonlyBricks && !props.onChange) return <>{`Brick(${brickType ?? 'none'})`}</>;
	return (
		<>
			{!props.type.brickType && 
			<div>
				Type: <BrickTypeEditor defaultValue={brickType} onChange={!brickType ? setBrickType : undefined} />
			</div>}
			{props.type.params && <div>
				Params: <BrickParamsEditor readonly={!props.onChange} defaultValue={brickParams} onChange={onChangeBrickParams} />
			</div>}
			{brickType && (
				<BrickTreeEditor
					brickParams={brickParams}
					brickTree={brickTree}
					brickType={brickType}
					onChange={props.onChange && onChangeBrickTree}
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
	const { projectName } = useProject();

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
		let opn = window.open(`brickEditor.${props.templateCode}.${props.objectId}.${props.fieldCode}${props.onChange ? '?edit' : ''}`, '_blank', props.onChange ? undefined : 'noopener');
		window.requestData = () => {
			if (opn.loadData) {
				opn.loadData(props)
			}
		}
		window.getProjectName = () => {
			return projectName
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

export const FilterRender = BrickTypeEditor;
