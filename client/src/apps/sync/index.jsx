import { Button, Select, Input } from 'antd';
import { useState } from 'react';
import { useProject } from '../../contexts/project';
const { TextArea } = Input;
const { Option } = Select;

export function ContentImporter() {
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

export function ContentExporter() {
	const [exportType, setExportType] = useState('full');
	const { sageApi } = useProject();

	const exportContent = async () => {
		let params = {
			objects: exportType === 'full' || exportType === 'objects',
			templates: exportType === 'full' || exportType === 'templates',
		};
		let content = await sageApi.project.getContent(params);
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

	return (
		<>
			<h1>Export content</h1>
			<Select onChange={setExportType} defaultValue="full">
				<Option value="full">Full</Option>
				<Option value="templates">Templates</Option>
				<Option value="objects">Objects</Option>
			</Select>
			<p> EXPORT CONTENT: </p>
			<Button onClick={exportContent}> Export </Button>
		</>
	);
}

