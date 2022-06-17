import { Button, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../contexts/project';
import { migrator } from './migrators/17.06.22_eclipse';

const { TextArea } = Input;

export default function Migrator() {
	const [result, setResult] = useState('');
	const { sageApi } = useProject();

	const applyMigrator = async () => {
		let content = await sageApi.project.getContent();
		setResult(JSON.stringify(content, undefined, 2));
		let objects = migrator(content);
		sageApi.project.migrate({ objects });
	};

	return (
		<>
			<TextArea placeholder="Result will be here" rows={10} value={result} />
			<Button onClick={applyMigrator}> APPLY </Button>
		</>
	);
}
