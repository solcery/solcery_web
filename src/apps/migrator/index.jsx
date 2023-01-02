import { Button, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../../contexts/project';
import { migrator } from './migrations/20.12.22_newBricks';

const { TextArea } = Input;

export default function Migrator() {
	const [result, setResult] = useState('');
	const { engine } = useProject();

	const applyMigrator = async () => {
		let content = await engine.getContent({ objects: true, templates: true });
		let migrated = await migrator(content);
		setResult(JSON.stringify(migrated, undefined, 2));
		engine.migrate(migrated);
	};

	return (
		<>
			<h1>Migrations</h1>
			<TextArea placeholder="Result will be here" rows={10} value={result} />
			<Button onClick={applyMigrator}> APPLY </Button>
		</>
	);
}
