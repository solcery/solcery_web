import { BrickEditor } from './editor/BrickEditor';
import { ReactFlowProvider } from 'react-flow-renderer';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { paramFromMapEntry } from '../../brickLib';
import { Select, Button } from 'antd';
import { SType } from '../base';
import { insertTable } from '../../../utils';
import { useBrickLibrary } from '../../../contexts/brickLibrary';
import { useUser } from '../../../contexts/user';
import { useProject } from '../../../contexts/project';

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
	const [ value, setValue ] = useState(props.defaultValue || {});
	const navigate = useNavigate();

	let params;
	if (props.type.params) {
		params = {
			type: paramMapType,
			onChange: (val) => {
				console.log(val)
			}
		}
	}
	return (
		<>
			{params && <params.type.valueRender 
				defaultValue={value.brickParams} 
				type ={params.type}
				onChange={params.onChange}
				path = {{ ...props.path, fieldPath: [ ... props.path.fieldPath, 'brickParams' ] }}
			/>}
			<div
				onClick={() => {
				let path = props.path.fieldPath.join('.');
				if (!objectId) {
					path = props.path.objectId + '/' + path
				}
				navigate(path)
			}}> 
				<BrickTreeEditor
					brickParams={value.brickParams} 
					brickType={props.type.brickType ?? 'any'}
					brickTree={props.type.clone(value.brickTree)}
					type = {props.type}
				/>
			</div>
		</>
	);
};



export const BrickTreeEditor = (props) => {
	const [ownBrickLibrary, setOwnBrickLibrary] = useState();
	const { brickLibrary } = useBrickLibrary();
	const [ value, setValue ] = useState()

	useEffect(() => {
		setValue(props.type.clone(props.brickTree))
	}, [ props.brickTree ])


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

	if (!ownBrickLibrary) return <>Loading...</>;
	return (
		<ReactFlowProvider>
			<BrickEditor
				fullscreen = {props.fullscreen}
				brickLibrary={ownBrickLibrary}
				brickTree={value}
				brickType={props.brickType}
				onChange={props.onChange}
			/>
		</ReactFlowProvider>
	);
};

export const FilterRender = (props) => {
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
};;
