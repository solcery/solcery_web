import { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '../../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import GameClient from '../../components/gameClient';

export default function PlayPage() {
	const [ gameSession, setGameSession ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { sageApi } = useProject();
	const ref = useRef();

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
				let session = new Session({
					content,
					layoutPresets,
					nfts
				});
				session.start();
				setGameSession(session);
			} else {
				window.alert('Cannot construct content, validation unsucessful. Please content in project menu');
			}
		}
		buildContent();
	}, [layoutPresets, sageApi.project]);

	if (!gameSession) return <>Loading</>;
	return <div>
		<GameClient gameSession={gameSession}/>
	</div>;
}
