import { Button, Input } from 'antd';
import { SageAPI } from '../api';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

const { TextArea } = Input;


export default function TemplateSchema() {
	const { templateCode } = useParams();
	const [ schema, setSchema ] = useState();

	const loadSchema = (templateSchema) => {
		setSchema(JSON.stringify(templateSchema, undefined, 2));
	}

	useEffect(() => {
		SageAPI.template.getSchema(templateCode).then(loadSchema);
	}, [])

	const save = () => {
		let res = JSON.parse(schema);
		SageAPI.template.setSchema(templateCode, res);
	}

	if (!schema) return <>Loading</>;
	return (
		<>
			<p>Template: { }</p>
			<TextArea rows={20} defaultValue={schema} onChange = { e => setSchema(e.target.value) }/>
			<Button onClick={save}> save </Button>
		</>
	);
}
