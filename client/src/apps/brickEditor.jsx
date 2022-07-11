import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CollectionEditor from './collectionEditor';
import { useProject } from '../contexts/project';
import { useObject } from '../contexts/object';
import { useTemplate } from '../contexts/template';
import { BrickTreeEditor } from '../content/types/brick/components';
import { getTable } from '../utils';
import { SCustomBrick, SBrick } from '../content/types';

export default function BrickEditor() {
	const navigate = useNavigate();
	const { object, setField } = useObject();
	let { brickPath } = useParams();
	let { template } = useTemplate();
	const [ value, setValue ] = useState();

	useEffect(() => {
		if (!object) return;
		let res = getTable(object.fields, ...splittedPath);
		if (res) setValue(res);
	}, [ object ])
	
	const onApply = (val) => {
		let bt = {
			brickTree: val,
			brickParams: value.brickParams
		}
		console.log(bt)
		setField(bt, splittedPath)
		navigate('../')
	}
	if (!object) return <></>;
	if (!template) return <></>;

	let splittedPath = brickPath.split('.');

	if (!value) return <>NO VALUE</>;


	let fieldType = template.fields[splittedPath[0]].type

	// let brickType;
	// if (value) {
	// 	brickType = value.lib;
	// } else {
	// 	brickType = fieldType.brickType ?? 'any';
	// }

	return (<BrickTreeEditor
		fullscreen
		brickParams={value.brickParams}
		brickTree={value.brickTree}
		brickType={fieldType.brickType ?? 'any'}
		type = {fieldType}
		onChange={onApply}
	/>);
}
