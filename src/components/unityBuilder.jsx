import { useState } from 'react';
import { Button, Select, Card } from 'antd';
import { useUser } from '../contexts/user';
import { useProject } from '../contexts/project';
import { build, validate } from '../content';
import { DownloadJSON } from './DownloadJSON';
import { notify } from './notification';
import { Link, useNavigate } from 'react-router-dom';
import { Session } from '../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

export function UnityBuilder() {
	let navigate = useNavigate();
	const [result, setResult] = useState();
	const { sageApi  } = useProject();
	const { layoutPresets, nfts } = useUser();

	const buildForUnity = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		let res = build({ targets: ['web', 'unity_local'], content });
		if (!res.status) {
			notify({
				message: 'Unity build error',
				description: 'Content validation unsuccessfull',
				type: 'error'
			})
			navigate('validator');
			return;
		}
		let layout = layoutPresets;
		if (!layout || layout.length === 0) {
			layout = undefined; // TODO: empty layoutPresets should be undefined
		}
		content = res.constructed;
		content.unity = content.unity_local;
		let session = new Session({
			content,
			layout,
			nfts
		});
		session.start();
		let unityPackage = session.game.exportPackage();
		unityPackage.predict = true;
		setResult([
			{
				filename: 'game_content',
				data: content.unity_local,
			},
			{
				filename: 'game_content_overrides',
				data: session.getContentOverrides(),
			},
			{
				filename: 'game_state',
				data: unityPackage,
			},
		]);
	};

	return (
		<>
			{result && result.map(file => <DownloadJSON key={file.filename} filename={file.filename} data={file.data}/>)}
			<Button onClick={buildForUnity}>{result ? 'Rebuild' : 'Build'}</Button>
		</>
	);
}
