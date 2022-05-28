import { Button } from 'antd';
import { SageAPI } from '../api';

export default function ContentExporter() {
		
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

	return (
		<>
			<Button onClick={exportContent}> Download </Button>
		</>
	);
}
