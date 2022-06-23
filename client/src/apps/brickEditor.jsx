import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import CollectionEditor from './collectionEditor';
import { useProject } from '../contexts/project';
import { BrickTreeEditor } from '../content/types/brick/components';

export default function BrickEditor() {
	let { templateCode, objectId, fieldCode } = useParams();
	const [ value, setValue ] = useState();
	const [ brickType, setBrickType ] = useState();
	const [ brickLibrary, setBrickLibrary ] = useState();
	const { sageApi } = useProject();
	
	useEffect(() => {
	}, [ templateCode, objectId, fieldCode ])

	window.loadData = (props) => {
		setValue({
			brickParams: props.brickParams,
			brickType: props.brickType,
			brickTree: props.brickTree
		})
	}

	useEffect(() => {
		if (window.opener) {
			window.opener.requestData()
		} else {
			sageApi.template.getObjectById({ template: templateCode, objectId }).then((res) => {
				setValue(JSON.parse(JSON.stringify(res.fields[fieldCode])))
			})
		}
		const onKeyDown = (e) => {
			if (e.keyCode === 27) { //Escape
				window.close();
			}
		};

		window.addEventListener('keydown', onKeyDown);
		return () => {
			window.removeEventListener('keydown', onKeyDown);
		};
	}, [])

	if (!value) return <>Loading</>;

	const onApply = (val) => {
		if (window.opener) {
			window.opener.onApply(val);
		}
	}

	return <BrickTreeEditor
		fullscreen
		brickParams={value.brickParams}
		brickTree={value.brickTree}
		brickType={value.brickType}
		onChange={window.opener ? onApply : undefined}

	/>;
}
