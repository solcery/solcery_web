import { useEffect, useState } from 'react';
import { Template } from '../content/template';
import { useProject } from '../contexts/project';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ObjectEditor from './objectEditor';
import CollectionEditor from './collectionEditor';
import { notify } from '../components/notification';
import { useBrickLibrary } from '../contexts/brickLibrary';

export function BrickLibraryCollectionEditor() {
	return <CollectionEditor moduleName={'brickLibrary'} templateCode={'customBricks'} />;
}

export function BrickLibraryObjectEditor() {
	const [object, setObject] = useState(undefined);
	const [template, setTemplate] = useState(undefined);
	const { search } = useLocation();
	const searchParams = new URLSearchParams(search);
	const { load } = useBrickLibrary();
	const navigate = useNavigate();
	const { sageApi } = useProject();
	let { objectId } = useParams();

	useEffect(() => {
		sageApi.template.getObjectById({ template: 'customBricks', objectId }).then(setObject);
		sageApi.template.getSchema({ template: 'customBricks' }).then((data) => setTemplate(new Template(data)));
	}, [objectId, sageApi.template]);

	const onSave = (fields) => {
		sageApi.template
			.updateObjectById({
				template: 'customBricks',
				objectId,
				fields: object.fields,
			})
			.then((res) => {
				if (res.modifiedCount) {
					load();
					notify({
						message: 'Object updated',
						description: `${objectId}`,
						color: '#DDFFDD',
					});
					navigate(`../brickLibrary`);
				}
			});
	};
	return <ObjectEditor schema={template} object={object} onSave={onSave} instant={searchParams.get('instant')} />;
}
