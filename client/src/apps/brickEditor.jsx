import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CollectionEditor from './collectionEditor';
import { useProject } from '../contexts/project';
import { useHotkey } from '../contexts/hotkey';
import { useDocument } from '../contexts/document';
import { useTemplate } from '../contexts/template';
import { Button } from 'antd'
import { BrickTreeEditor } from '../content/types/brick/components';
import { getTable } from '../utils';
import { SCustomBrick, SBrick } from '../content/types';
import './brickEditor.css'

export default function BrickEditor() {
	const navigate = useNavigate();
	const { doc } = useDocument();
	let { templateCode, objectId, brickPath } = useParams();
	const [ value, setValue ] = useState();
	const [ changed, setChanged ] = useState(false);
	let splittedPath = brickPath.split('.');

	const goUp = () => {
		navigate('../');
	}

	useEffect(() => {
		if (!doc) return;
		let fieldType = doc.schema[splittedPath[0]].type;
		let res = getTable(doc.fields, ...splittedPath) ?? {
			brickParams: [],
			brickTree: undefined,
		};
		setValue(fieldType.clone(res))
	}, [ doc ])

	const onChangeBrickTree = (brickTree) => {
		value.brickTree = brickTree;
		let old = getTable(doc.fields, ...splittedPath);
		let fieldType = doc.schema[splittedPath[0]].type;
		setChanged(!fieldType.eq(old, value))
	}

	const save = useCallback(() => {
		doc.setField(value, splittedPath)
		goUp();
	}, [ value ]);
	useHotkey({ key: 'ctrl+s', noDefault: true }, save);
	
	const cancel = useHotkey('escape', () => {
		if (changed && !window.confirm('You have unsaved changed. Still leave?')) return;
		goUp();
	})

	if (!doc) return <>NO DOC</>;
	let path = [ templateCode, objectId, ... splittedPath ].join(' > ');
	let fieldType = doc.schema[splittedPath[0]].type
	return (
		<div className={'brick-editor-fullscreen'}>
			<p style={{ color: changed ? 'yellow' : 'white' }}>{path}</p>
			{<Button onClick={save}>SAVE</Button>}
			{<Button onClick={cancel}>CANCEL</Button>}
			{value && <BrickTreeEditor
				fullscreen
				brickParams={value.brickParams}
				brickTree={value.brickTree}
				brickType={fieldType.brickType ?? 'any'}
				onChange={onChangeBrickTree}
			/>}
		</div>
	);
}
