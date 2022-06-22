import { Button, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../contexts/project';
import { migrator } from './migrators/22.06.22_retrodates';
import { SageAPIConnection} from '../api';

const { TextArea } = Input;

export default function Migrator() {
	const [result, setResult] = useState('');
	const { sageApi } = useProject();

	const applyMigrator = async () => {
		let oldApi = new SageAPIConnection('project_eclipse')
		let oldContent = await oldApi.project.getContent();
		let content = await sageApi.project.getContent();
		let { objects } = migrator(content, oldContent);
		setResult(JSON.stringify(content, undefined, 2));
		sageApi.project.migrate({ objects });
	};

	return (
		<>
			<TextArea placeholder="Result will be here" rows={10} value={result} />
			<Button onClick={applyMigrator}> APPLY </Button>
		</>
	);
}
