import { Button, Input, Select } from 'antd';
import { useState } from 'react';
import { useProject } from '../contexts/project';
const { TextArea } = Input;

export default function ContentImporter() {
	const [contentDump, setContentDump] = useState();
	const { sageApi } = useProject();

	const importContent = () => {
		sageApi.project.restore({ src: JSON.parse(contentDump) });
	};

	return (
		<>
			<h1>Import content</h1>
			<TextArea placeholder="Paste content dump here" rows={10} onChange={(e) => setContentDump(e.target.value)} />
			<Button onClick={importContent}> Import </Button>
		</>
	);
}
