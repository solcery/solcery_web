import { useState, useEffect } from 'react';
import { Button, Select, Card } from 'antd';
import { useUser } from '../../contexts/user';
import { UnityBuilder } from '../../components/unityBuilder';
import { notify } from '../../components/notification';
import { useProject } from '../../contexts/project';
import { build, validate } from '../../content';
import { Link, useNavigate } from 'react-router-dom';
import { Session } from '../../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

export default function Home() {
	const navigate = useNavigate();
	const [unityData, setUnityData] = useState();
	const { sageApi, projectConfig } = useProject();
	const { layoutPresets, nfts } = useUser();
	const [ contentRevision, setContentRevision ] = useState();

	const releaseProject = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		let res = await build({ targets: ['web', 'unity_local'], content });
		if (!res.status) {
			notify({
				message: 'Release error',
				description: 'Content validation unsuccessfull',
				type: 'error'
			})
			navigate('validator')
			return;
		}
		let result = await sageApi.project.release({
			gameProjectId: projectConfig.releaseProjectId,
			contentWeb: res.constructed.web,
			contentUnity: res.constructed.unity_local,
		})
		if (result.insertedId) {
			notify({
				message: 'Release successful!',
				description: `Released version: 6`,
				type: 'success'
			})
		}
	}

	const syncContent = async () => {
		let res = await sageApi.project.sync();
		if (!res) return;
		notify({
			message: 'Sync successful',
			type: 'success',
		})
	}

	useEffect(() => {
		sageApi.project.getContent({ templates: true }).then(content => {
			let revision = 0;
			for (let template of content.templates) {
				revision = revision + template.revision;
			}
			setContentRevision(revision);
		})
	}, [ sageApi.project ])

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
					<Button onClick={syncContent}>Sync from {`[${projectConfig.parentProjectId}]`}</Button>
				}		
			</Card>}
		</>
	);
}
