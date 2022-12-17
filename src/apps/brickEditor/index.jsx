import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHotkey } from '../../contexts/hotkey';
import { useDocument } from '../../contexts/document';
import { useUser } from '../../contexts/user';
import { Button } from 'antd';
import { BrickTreeEditor } from '../../content/types/brick/components';
import { getTable } from '../../utils';
import './style.css';

export default function BrickEditor() {
	const navigate = useNavigate();
	const { doc } = useDocument();
	const { showBrickComments } = useUser();
	let { templateCode, objectId, brickPath } = useParams();
	const [value, setValue] = useState();
	const [splittedPath, setSplittedPath] = useState();
	const [ showAllComments, setShowAllComments ] = useState(false);
	const changed = useRef(false);

	useEffect(() => {
		setShowAllComments(showBrickComments)
	}, [ showBrickComments ]);
	
	const goUp = useCallback(() => {
		navigate('../', { 
			state: {
				scrollToField: splittedPath[0],
			}
		});
	}, [ navigate, splittedPath ])

	useEffect(() => {
		setSplittedPath(brickPath.split('.'));
	}, [brickPath]);

	useEffect(() => {
		if (!doc || !splittedPath) return;
		let fieldType = doc.schema[splittedPath[0]].type;
		let res = getTable(doc.fields, ...splittedPath) ?? {
			brickParams: [],
			brickTree: undefined,
		};
		setValue(fieldType.clone(res));
	}, [doc, doc.schema, splittedPath]);

	const onChangeBrickTree = useCallback(
		(brickTree) => {
			console.log('onChangeBrickTree', brickTree)
			if (!doc) return;
			value.brickTree = brickTree;
			let old = getTable(doc.fields, ...splittedPath);
			let fieldType = doc.schema[splittedPath[0]].type;
			changed.current = !fieldType.eq(old, value);
		},
		[splittedPath, doc, value]
	);

	const save = useCallback(() => {
		doc.setField(value, splittedPath);
		goUp();
	}, [value, doc, goUp, splittedPath]);
	useHotkey({ key: 'Ctrl+KeyS', noDefault: true }, save);

	const cancel = useHotkey('Escape', () => {
		if (changed.current && !window.confirm('You have unsaved changed. Still leave?')) return;
		goUp();
	});

	const toggleComments = () => {
		setShowAllComments(!showAllComments)
	}

	if (!doc || !splittedPath) return <>NO DOC</>;
	let path = [templateCode, objectId, ...splittedPath].join(' > ');
	let fieldType = doc.schema[splittedPath[0]].type;
	return (
		<div className={'brick-editor-fullscreen'}>
			<p>{path}</p>
			<Button onClick={save}>SAVE</Button>
			<Button onClick={cancel}>CANCEL</Button>
			<Button onClick={toggleComments}>{showAllComments ? 'Hide comments' : 'Show comments' }</Button>
			<div style={{ width: 800, height: 600 }}>
			{value && (
				<BrickTreeEditor
					fullscreen
					brickParams={value.brickParams}
					brickTree={value.brickTree}
					brickType={fieldType.brickType ?? 'any'}
					onChange={onChangeBrickTree}
					showAllComments={showAllComments}
				/>
			)}
			</div>
		</div>
	);
}
