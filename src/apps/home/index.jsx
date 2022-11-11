import { useState, useEffect } from 'react';
import { Button, Select, Card } from 'antd';
import { useUser } from '../../contexts/user';
import { UnityBuilder } from '../../components/unityBuilder';
import { notif } from '../../components/notification';
import { useProject } from '../../contexts/project';
import { build, validate } from '../../content';
import { Link, useNavigate } from 'react-router-dom';
import { Session } from '../../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

export default function Home() {
	const navigate = useNavigate();
	const [unityData, setUnityData] = useState();
	const { engine } = useProject();
	const { layoutPresets, nfts } = useUser();
	const [ contentRevision, setContentRevision ] = useState();
	const [ projectConfig, setProjectConfig ] = useState();

	const releaseProject = async () => {
		let targets = [
			{
				name: 'web',
				format: 'web',
			},
			{
				name: 'web_meta',
				format: 'web',
			},
			{
				name: 'matchmaker',
				format: 'web',
			},
			{
				name: 'unity_local',
				format: 'unity'
			},
			{
				name: 'bot',
				format: 'web'
			}
		];
		let content = await engine.getContent({ objects: true, templates: true });
		let res = await build({ targets, content });
		if (!res.status) {
			notif.error('Release error', 'Content is not valid');
			navigate('validator')
			return;
		}
		engine.release({
			web: res.constructed.web,
			unity: res.constructed.unity_local,
			meta: res.constructed.web_meta,
			matchmaker: res.constructed.matchmaker,
			bot: res.constructed.bot,
		}).then(newVersion => {
			notif.success(`Released new version: ${newVersion}`)
		})
	}

	const syncContent = () => {
		let res = engine.sync().then(() => {
			notif.success('Sync successful');
		});
	}

	useEffect(() => {
		engine.getContent({ templates: true }).then(content => {
			let revision = 0;
			for (let template of content.templates) {
				revision = revision + template.revision;
			}
			setContentRevision(revision);
		})
		engine.getConfig().then(config => setProjectConfig(config));
	}, [ engine ])

	if (!projectConfig) return;
	return (
		<>
			<Card title='Status'>
				<p>Project name: {projectConfig.projectName}</p>
				<p>Content revision: { contentRevision ?? 'Loading...'}</p>
			</Card>
			<Card title="Build for Unity">
				<UnityBuilder/>
			</Card>
			{projectConfig.releaseProjectId && <Card title="Release">
				<Button onClick={releaseProject}>RELEASE!</Button>
			</Card>}
			{projectConfig.sync && <Card title="Sync">
				{projectConfig.sync.isLocked && <>
					<p>Sync is locked!</p>
					<p>Reason: {projectConfig.sync.reason}</p>
				</>}
				{!projectConfig.sync.isLocked &&
					<Button onClick={syncContent}>Sync from {`[${projectConfig.sync.sourceProjectId}]`}</Button>
				}		
			</Card>}
		</>
	);
}
