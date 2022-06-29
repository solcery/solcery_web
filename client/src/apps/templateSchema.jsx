import { Button, Input } from 'antd';
import { useProject } from '../contexts/project';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { notify } from '../components/notification';

const { TextArea } = Input;

export default function TemplateSchema() {
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
			schema = JSON.parse(jsonSchema)
		} catch {
			notify({ message: 'JSON parsing error', color: '#FFDDDD' });
			return;
		}
		console.log(schema)
		if (schema) {
			sageApi.template.setSchema({ template: templateCode, schema }).then(res => {
				if (res.acknowledged) {
					notify({ message: 'Schema applied!', color: '#DDFFDD' });
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
