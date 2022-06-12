import { Button, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../contexts/project';
const { TextArea } = Input;

export default function ContentExporter() {
	const [contentDump, setContentDump] = useState();
	const { sageApi } = useProject();

	const exportContent = async () => {
		let content = await sageApi.project.dump();
		let projectName = sageApi.projectName;

		let date = Date.now();
		let data = JSON.stringify(content, undefined, 2);
		const element = document.createElement('a');
		const file = new Blob([data], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = `content_dump_${projectName}_${date}.json`; // TODO: add_date and project
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
	};

	const importContent = () => {
		sageApi.project.restore({ src: JSON.parse(contentDump) });
	};

	return (
		<>
			<p> EXPORT CONTENT: </p>
			<Button onClick={exportContent}> Export </Button>
			<p></p>
			<p> IMPORT CONTENT </p>
			<TextArea placeholder="Paste content dump here" rows={10} onChange={(e) => setContentDump(e.target.value)} />
			<Button onClick={importContent}> Import </Button>
		</>
	);
}
