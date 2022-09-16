import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session } from '../../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import GameClient from '../../components/gameClient';
import { notify } from '../../components/notification';

export default function PlayPage() {
	const [ gameSession, setGameSession ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { sageApi, projectConfig } = useProject();
	let navigate = useNavigate()

	const onError = (err) => {
		console.log('onPlayPageError');
		console.log(err)
	}

	useEffect(() => {
		async function buildContent() {
			let content = await sageApi.project.getContent({ objects: true, templates: true });
			let construction = build({
				targets: ['web', 'unity_local'],
				content,
			});
			if (construction.status) {
				construction.constructed.unity = construction.constructed.unity_local;
				let content = construction.constructed;
				let layout = layoutPresets;
				if (!layout || layout.length === 0) {
					layout = undefined; // TODO: empty layoutPresets should be undefined
				}
				let seed = Math.floor(Math.random() * 255);
				let session = new Session({
					content,
					layout,
					nfts,
					seed,
					onError
				});
				session.start();
				setGameSession(session);
			} else {
				notify({
					message: 'Play mode error',
					description: 'Content validation unsuccessfull',
					type: 'error'

				})
				navigate('../validator');
			}
		}
		buildContent();
	}, [layoutPresets, sageApi.project]);

	if (!gameSession) return <>Loading</>;
	return <div>
		<GameClient unityBuild={projectConfig.build} gameSession={gameSession} onError={onError}/>
	</div>;
}
