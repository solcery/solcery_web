import { useState, useEffect, useCallback } from 'react';
import { Session } from '../../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import GameClient from '../../components/gameClient';

const unityPlayContext = new UnityContext({
	loaderUrl: '/Build/WebGl.loader.js',
	dataUrl: '/Build/WebGl.data',
	frameworkUrl: '/Build/WebGl.framework.js',
	codeUrl: '/Build/WebGl.wasm',
	streamingAssetsUrl: '/StreamingAssets',
});

function* stringChunk(s, maxBytes) {
	const SPACE_CODE = 32;
	let buf = Buffer.from(s);
	while (buf.length) {
		let i = buf.lastIndexOf(SPACE_CODE, maxBytes + 1);
		if (i < 0) i = buf.indexOf(SPACE_CODE, maxBytes);
		if (i < 0) i = buf.length;
		yield buf.slice(0, i).toString();
		buf = buf.slice(i + 1);
	}
}

export default function PlayPage() {
	const [ gameSession, setGameSession ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { sageApi } = useProject();

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

	return <GameClient gameSession={gameSession}/>;
}
