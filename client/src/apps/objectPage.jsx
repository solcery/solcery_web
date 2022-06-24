import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Template } from '../content/template';
import { useProject } from '../contexts/project';
import ObjectEditor from './objectEditor';
import { notify } from '../components/notification';

export default function ObjectPage() {
	const [object, setObject] = useState(undefined);
	const [template, setTemplate] = useState(undefined);
	const navigate = useNavigate();
	const { sageApi } = useProject();
	let { templateCode, objectId } = useParams();

	useEffect(() => {
		sageApi.template.getObjectById({ template: templateCode, objectId }).then(setObject);
		sageApi.template.getSchema({ template: templateCode }).then((data) => setTemplate(new Template(data)));
	}, [sageApi.template, objectId, templateCode]);

	const onSave = (fields) => {
		sageApi.template
			.updateObjectById({
				template: templateCode,
				objectId,
				fields,
			})
			.then((res) => {
				if (res.modifiedCount) {
					notify({
						message: 'Object updated',
						description: `${objectId}`,
						color: '#DDFFDD',
					});
					navigate(`../template.${templateCode}`);
				}
			});
	};
	return <ObjectEditor schema={template} object={object} onSave={onSave} />;
}
