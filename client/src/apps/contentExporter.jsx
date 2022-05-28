import { Button } from 'antd';
import { SageAPI } from '../api';

export default function ContentExporter() {
		
	const exportContent = async () => {

		let content = await SageAPI.project.dump();
		console.log(content);
		let data = JSON.stringify(content);
	    const element = document.createElement("a");
	    const file = new Blob([data], {type: 'text/plain'});
	    element.href = URL.createObjectURL(file);
	    element.download = 'content_dump'; // TODO: add_date and project
	    document.body.appendChild(element); // Required for this to work in FireFox
	    element.click();
	}

	return (
		<>
			<Button onClick={exportContent}> Download </Button>
		</>
	);
}
