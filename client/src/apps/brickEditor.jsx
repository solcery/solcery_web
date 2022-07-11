import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CollectionEditor from './collectionEditor';
import { useProject } from '../contexts/project';
import { useHotkey } from '../contexts/hotkey';
import { useDocument } from '../contexts/document';
import { useTemplate } from '../contexts/template';
import { BrickTreeEditor } from '../content/types/brick/components';
import { getTable } from '../utils';
import { SCustomBrick, SBrick } from '../content/types';

export default function BrickEditor() {
	const navigate = useNavigate();
	const { doc } = useDocument();
	let { brickPath } = useParams();
	const [ value, setValue ] = useState();

	let splittedPath = brickPath.split('.');

	const goUp = () => {
		navigate('../');
	}

	useEffect(() => {
		if (!doc) return;
		let res = getTable(doc.fields, ...splittedPath);
		if (res) {
			setValue(res);
		} else {
			let fieldType = doc.schema[splittedPath[0]].type
			setValue({
				brickParams: [],
				brickTree: undefined,
			})
		}

	}, [ doc ])

	const onCancel = () => {
		console.log('onCancel')
		goUp();
	}

	const onApply = (val) => {
		let bt = {
			brickParams: value.brickParams,
			brickTree: val,
		}
		doc.setField(bt, splittedPath)
		goUp();
	}
	if (!doc) return <>NO DOC</>;
	if (!value) return <>NO VALUE</>;

	let fieldType = doc.schema[splittedPath[0]].type
	return (<BrickTreeEditor
		fullscreen
		brickParams={value.brickParams}
		brickTree={fieldType.clone(value.brickTree)}
		brickType={fieldType.brickType ?? 'any'}
		type = {fieldType}		
		onChange={onApply}
		onCancel={onCancel}
	/>);
}
