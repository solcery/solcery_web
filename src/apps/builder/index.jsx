import { useState } from 'react';
import { Button, Select, Card } from 'antd';
import { useUser } from '../../contexts/user';
import { DownloadJSON } from '../../components/DownloadJSON';
import { notif } from '../../components/notification';
import { useProject } from '../../contexts/project';
import { build, validate } from '../../content';
import { Link, useNavigate } from 'react-router-dom';
import { Session } from '../../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

let targets = [
	{
		name: 'web',
		format: 'web',
	},
	{
		name: 'unity_local',
		format: 'unity'
	},
	{
		name: 'bot',
		format: 'web',
	},
];

export default function Builder() {
	const navigate = useNavigate();
	const [targets, setTargets] = useState([]);
	const [result, setResult] = useState()
	const { engine } = useProject();

	const buildProject = async () => {
		setResult();
		let content = await engine.getContent({ objects: true, templates: true });
		let res = await build({ targets, content });
		if (!res.status) {
			notif.error('Build error', 'Content is not valid');
			navigate('../validator');
			return;
		}
		console.log(res)
		setResult(res.constructed)
	};

	return (<>
		<Card title="Build settings">
			<Select style={{ minWidth: '200px' }} mode="multiple" onChange={setTargets}>
				<Option value="web">Web</Option>
				<Option value="web_meta">Web-Meta</Option>
				<Option value="unity">Unity</Option>
				<Option value="unity_local">Unity-Local</Option>
			</Select>
			<Button onClick={buildProject}>BUILD</Button>
		</Card>
		{result && <Card title="Result">
			{Object.entries(result).map(([target, data ]) => <DownloadJSON key={target} filename={target} data={data} />)}
		</Card>}
	</>);
}
