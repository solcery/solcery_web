import { Button, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../../contexts/project';
import { migrator } from './migrators/06.09.22_noPauseSounds';

const { TextArea } = Input;

export default function Migrator() {
	const [result, setResult] = useState('');
	const { sageApi } = useProject();

	const applyMigrator = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		let migrated = migrator(content);
		setResult(JSON.stringify(migrated, undefined, 2));
		sageApi.project.migrate(migrated);
	};

	return (
		<>
			<h1>Migrations</h1>
			<TextArea placeholder="Result will be here" rows={10} value={result} />
			<Button onClick={applyMigrator}> APPLY </Button>
		</>
	);
}
