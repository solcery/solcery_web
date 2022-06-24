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
	const [ connectedProjectName, setConnectedProjectName ] = useState();
	const { sageApi, projectName } = useProject();
	const [ editMode, setEditMode ] = useState(false);

	window.loadData = (props) => {
		setEditMode(true);
		setValue({
			brickParams: props.brickParams,
			brickType: props.brickType,
			brickTree: props.brickTree
		})
	}

	useEffect(() => {
		if (window.opener && window.opener.getProjectName() === projectName) {
			window.opener.requestData()
		} else {
			sageApi.template.getObjectById({ template: templateCode, objectId }).then((res) => {
				setValue(JSON.parse(JSON.stringify(res.fields[fieldCode])))
				setEditMode(false)
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
	}, [ sageApi, projectName ])

	if (!value) return <>Loading</>;

	const onApply = (val) => {
		window.opener.onApply(val);
	}

	return <BrickTreeEditor
		fullscreen
		brickParams={value.brickParams}
		brickTree={value.brickTree}
		brickType={value.brickType}
		onChange={editMode ? onApply : undefined}

	/>;
}
