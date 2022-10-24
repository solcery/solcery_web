import { Button, Input } from 'antd';
import { useProject } from '../../contexts/project';
import { useParams, Navigate } from 'react-router-dom';
import { useTemplate } from '../../contexts/template';
import { useState, useEffect } from 'react';
import { notif } from '../../components/notification';
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
	const { engine } = useProject();

	const loadSchema = (templateSchema) => {
		setJsonSchema(JSON.stringify(templateSchema, undefined, 2));
	};

	useEffect(() => {
		engine.template(templateCode).getSchema().then(loadSchema);
	}, [templateCode, engine]);

	const save = () => {
		let schema;
		try {
			schema = JSON.parse(jsonSchema);
		} catch {
			notif.error('JSON parsing error');
			return;
		}
		if (schema) {
			engine.template(templateCode).setSchema(schema).then((res) => {
				if (res.acknowledged) {
					notif.success('Schema applied!');
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
