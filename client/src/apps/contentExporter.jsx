import { Button, Input } from 'antd';
import { useState } from 'react';
import { SageAPI } from '../api';
const { TextArea } = Input;

export default function ContentExporter() {
		
	const [ contentDump, setContentDump ] = useState();

	const exportContent = async () => {
		let content = await SageAPI.project.dump();
		let projectName = SageAPI.projectName;

		let date = Date.now();
		let data = JSON.stringify(content, undefined, 2);
	    const element = document.createElement("a");
	    const file = new Blob([data], {type: 'text/plain'});
	    element.href = URL.createObjectURL(file);
	    element.download = `content_dump_${projectName}_${date}.json`; // TODO: add_date and project
	    document.body.appendChild(element); // Required for this to work in FireFox
	    element.click();
	}

	const importContent = () => {
		let x = JSON.parse(contentDump)
		console.log(x)
		SageAPI.project.restore(JSON.parse(contentDump))
	}

	return (
		<>
			<p> EXPORT CONTENT: </p>
			<Button onClick={ exportContent }> Export </Button>
			<p></p>
			<p> IMPORT CONTENT </p>
			<TextArea placeholder = 'Paste content dump here' rows={10} onChange = { e => setContentDump(e.target.value) }/>
			<Button onClick={ importContent }> Import </Button>
		</>
	);
}
