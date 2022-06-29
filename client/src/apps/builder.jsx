import { useState } from 'react';
import { Button, Select, Card } from 'antd';
import { useUser } from '../contexts/user';
import { useProject } from '../contexts/project';
import { build, validate } from '../content';
import { Link } from 'react-router-dom';
import { Session } from '../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

export default function Builder() {
	const [target, setTarget] = useState('web');
	const [errors, setErrors] = useState([]);
	const [unityData, setUnityData] = useState(undefined);
	const { sageApi } = useProject();
	const { layoutPresets } = useUser();

	const buildProject = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		setErrors([]);
		let res = await build({ targets: [target], content });
		if (!res.status) {
			setErrors(res.errors);
			return;
		}
		console.log(JSON.stringify(res.constructed));
	};

	const validateProject = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		setErrors([]);
		let res = await validate({ content });
		if (!res.status) {
			setErrors(res.errors);
			return;
		}
		window.alert('Everything seems fine!');
	};

	const downloadAsJSON = async (filename, data) => {
		// let date = Date.now();
		let json = JSON.stringify(data, undefined, 2);
		const element = document.createElement('a');
		const file = new Blob([json], { type: 'text/plain' });
		element.href = URL.createObjectURL(file);
		element.download = `${filename}.json`; // TODO: date
		document.body.appendChild(element); // Required for this to work in FireFox
		element.click();
	};

	const downloadForUnityLocalSim = (filetype) => {
		downloadAsJSON(`game_${filetype}`, unityData[filetype]);
	};

	const buildForUnity = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		setUnityData(undefined);
		setErrors([]);
		let res = build({ targets: ['web', 'unity_local'], content });
		if (!res.status) {
			setErrors(res.errors);
			return;
		}
		let session = new Session({ web: res.constructed.web, unity: res.constructed.unity_local }, [1]);
		session.start(layoutPresets);

		let states = session.game.diffLog.map((state, index) => {
			return {
				id: index,
				state_type: state.delay ? 1 : 0,
				value: state,
			};
		});
		setUnityData({
			content: res.constructed.unity_local,
			state: { states },
		});
	};

	return (
		<>
			<h1>Builder</h1>
			<Card title="Test targets">
				<Select defaultValue="web" onChange={setTarget}>
					<Option value="web">Web</Option>
					<Option value="unity">Unity</Option>
				</Select>
				<Button onClick={buildProject}>BUILD</Button>
			</Card>
			<Card title="For unity local simulation">
				{unityData && (
					<Button icon=<DownloadOutlined /> onClick={() => downloadForUnityLocalSim('content')}>
						Content
					</Button>
				)}
				{unityData && (
					<Button icon=<DownloadOutlined /> onClick={() => downloadForUnityLocalSim('state')}>
						State
					</Button>
				)}
				<Button onClick={buildForUnity}>Build for Unity simulation</Button>
			</Card>
			<Card title="Validation">
				<Button onClick={validateProject}>Check content</Button>
			</Card>
			{errors.length > 0 && (
				<Card title="Errors">
					{errors.map((err, index) => (
						<Link key={`error.${index}`} to={`../template.${err.template}.${err.object}`}>
							{err.message}
						</Link>
					))}
				</Card>
			)}
		</>
	);
}
