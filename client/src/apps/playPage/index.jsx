import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import GameClient from '../../components/gameClient';
import { notify } from '../../components/notification';

export default function PlayPage() {
	const [ serverGame, setServerGame ] = useState();
	const [ game, setGame ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { sageApi, projectConfig } = useProject();
	let navigate = useNavigate()

	const onError = (err) => {
		console.log('onPlayPageError');
		console.error(err)
	}

	useEffect(() => {
		async function buildContent() {
			let content = await sageApi.project.getContent({ objects: true, templates: true });
			let construction = build({
				targets: ['web', 'unity_local'],
				content,
			});
			if (!construction.status) {
				notify({
					message: 'Play mode error',
					description: 'Content validation unsuccessfull',
					type: 'error'

				})
				navigate('../validator');
			}
			construction.constructed.unity = construction.constructed.unity_local;
			content = construction.constructed;


			let layoutOverride = layoutPresets;
			if (!layoutOverride || layoutOverride.length === 0) {
				layoutOverride = undefined; // TODO: empty layoutPresets should be undefined
			}
			let seed = Math.floor(Math.random() * 255);
			let game = new Game({
				content,
				layoutOverride,
				nfts,
				seed,
				onError
			});
			setGame(game);
		}
		buildContent();
	}, [layoutPresets, sageApi.project]);

	if (!game) return <>Loading</>;
	return <div>
		<GameClient game={game} onError={onError}/>
	</div>;
}
