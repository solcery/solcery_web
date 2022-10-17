import { Button, Input } from 'antd';
import { useProject } from '../../contexts/project';
import { useParams, Navigate } from 'react-router-dom';
import { useTemplate } from '../../contexts/template';
import { useState, useEffect } from 'react';
import { notify } from '../../components/notification';
import StorageViewer from '../storage';

const { TextArea } = Input;

export function TemplatePage() {
	let { template } = useTemplate();
	if (!template) return;
	if (template.singleton) return <Navigate to={template.singleton}/>;
	return <StorageViewer templateCode={template.code} moduleName={`template.${template.code}`} />;
}

export function TemplateSchema() {
	const { templateCode } = useParams();
	const [jsonSchema, setJsonSchema] = useState();
	const { sageApi } = useProject();

	const loadSchema = (templateSchema) => {
		setJsonSchema(JSON.stringify(templateSchema, undefined, 2));
	};

	useEffect(() => {
		sageApi.template.getSchema({ template: templateCode }).then(loadSchema);
	}, [templateCode, sageApi.template]);

	const save = () => {
		let schema;
		try {
			schema = JSON.parse(jsonSchema);
		} catch {
			notify({ message: 'JSON parsing error', type: 'error' });
			return;
		}
		if (schema) {
			sageApi.template.setSchema({ template: templateCode, schema }).then((res) => {
				if (res.acknowledged) {
					notify({ message: 'Schema applied!', type: 'success' });
				}
			});
		}
	};

	if (!jsonSchema) return <>Loading</>;
	return (
		<>
			<p>Template: {}</p>
			<TextArea rows={20} defaultValue={jsonSchema} onChange={(e) => setJsonSchema(e.target.value)} />
			<Button onClick={save}> save </Button>
		</>
	);
}
