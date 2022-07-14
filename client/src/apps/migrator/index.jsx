import { Button, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../../contexts/project';
import { migrator } from './migrators/14.07.22_attrLinks';

const { TextArea } = Input;

export default function Migrator() {
	const [result, setResult] = useState('');
	const { sageApi } = useProject();

	const applyMigrator = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		let { objects } = migrator(content);
		setResult(JSON.stringify(objects, undefined, 2));
		sageApi.project.migrate({ objects });
	};

	return (
		<>
			<h1>Migrations</h1>
			<TextArea placeholder="Result will be here" rows={10} value={result} />
			<Button onClick={applyMigrator}> APPLY </Button>
		</>
	);
}
