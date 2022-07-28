import { BrickEditor } from './editor/BrickEditor';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { paramFromMapEntry } from '../../brickLib';
import { Select, Popover } from 'antd';
import { SType } from '../base';
import { insertTable } from '../../../utils';
import { useBrickLibrary } from '../../../contexts/brickLibrary';
import { useUser } from '../../../contexts/user';

const { Option } = Select;

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

export const ValueRender = (props) => {
	const { objectId } = useParams();
	let brickTree = useRef(props.defaultValue ? props.defaultValue.brickTree : undefined);
	const [brickParams, setBrickParams] = useState(props.defaultValue ? props.defaultValue.brickParams : []);
	const { readonlyBricks } = useUser();
	const navigate = useNavigate();
	const element = useRef();

	const onChangeBrickParams = (bp) => {
		props.onChange({ brickParams: bp, brickTree: brickTree.current });
		setBrickParams(paramMapType.clone(bp));
	};
	let path = props.path.fieldPath.join('.');
	if (!objectId) {
		path = props.path.objectId + '/' + path;
	}


	const onLoad = () => {
		if (props.autoScroll && element.current) {
			element.current.scrollIntoView({ block: 'center' });
		}
	}
	let brickTreeEditor = ( //TODO: Optimize
		<BrickTreeEditor
			brickParams={brickParams}
			brickType={props.type.brickType ?? 'any'}
			brickTree={brickTree.current}
			autoScroll={props.autoScroll}
			onLoad={onLoad}
		/>
	);
	return (
		<>
			{props.type.params && (
				<paramMapType.valueRender
					defaultValue={brickParams}
					type={paramMapType}
					onChange={props.onChange && onChangeBrickParams}
					path={{ ...props.path, fieldPath: [...props.path.fieldPath, 'brickParams'] }}
				/>
			)}
			{props.onChange || readonlyBricks ? (
				<div
					ref={element}
					onClick={() => {
						navigate(path);
					}}
				>
					{brickTreeEditor}
				</div>
			) : (
				<Popover content={brickTreeEditor}>
					<Link to={path}>{brickTree.current ? `Brick. ${props.type.brickType ?? 'any'}` : 'Empty'}</Link>
				</Popover>
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
		if (!brickLibrary) return;
		let bricks = {};

		Object.entries(brickLibrary).forEach(([lib, libBricks]) =>
			Object.entries(libBricks).forEach(([brickFunc, brick]) => insertTable(bricks, brick, lib, brickFunc))
		);

		if (props.brickParams) {
			let paramsLibrary = mapParams(props.brickParams);
			Object.entries(paramsLibrary).forEach(([lib, libBricks]) =>
				Object.entries(libBricks).forEach(([brickFunc, brick]) => insertTable(bricks, brick, lib, brickFunc))
			);
		}
		setOwnBrickLibrary(bricks);
	}, [brickLibrary, props.brickParams]);

	useEffect(() => {
		if (ownBrickLibrary) {
			props.onLoad && props.onLoad();
		}
	}, [ props, props.onLoad, ownBrickLibrary ])

	if (!ownBrickLibrary) return <>Loading...</>;
	return (
		<ReactFlowProvider>
			<BrickEditor 
				{...props}
				brickLibrary={ownBrickLibrary}
			/>
		</ReactFlowProvider>
	);
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
