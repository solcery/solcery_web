import { Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

export const DownloadJSON = (props) => {

	const download = () => {
		let json = JSON.stringify(props.data, undefined, 2);
		const element = document.createElement('a');
		const file = new Blob([json], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = `${props.filename}.json`;
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
	};

	if (!props.filename || !props.data) return <>...</>;
	return <Button icon=<DownloadOutlined /> onClick={download}>
		{props.filename}
	</Button>;
}
