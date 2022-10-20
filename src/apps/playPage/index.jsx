import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../game';
import { SolceryAPIConnection } from '../../api';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { Select, Button } from 'antd';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import { GameProvider } from '../../contexts/game';
import GameClient from '../../components/gameClient';
import { notify } from '../../components/notification';

const { Option } = Select;

let apiConfig = {
	modules: [
		'template',
	],
}

export default function PlayPage() {
	const [ game, setGame ] = useState();
	const [ playerGames, setPlayerGames ] = useState();
	const [ player, setPlayer ] = useState();
	const [ players, setPlayers ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { sageApi, projectConfig } = useProject();
	const [ playerId, setPlayerId ] = useState();
	const [ selectedPlayerId, setSelectedPlayerId ] = useState();
	const [ unityBuild, setUnityBuild ] = useState();
	const [ content, setContent ] = useState();

	let navigate = useNavigate()

	const buildContent = async () => {
		if (!projectConfig) return;
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
		return construction.constructed;
	}

	const getUnityBuild = async (buildId) => {
		let systemApi = new SolceryAPIConnection('solcery', apiConfig);
		let buildObject = await systemApi.template.getObjectById({ 
			objectId: buildId, 
			template: 'unityBuilds',
		});
		return buildObject.fields;
	}

	useEffect(() => {
		if (!sageApi) return;
		if (!content) {
			buildContent().then(setContent);
			return;
		}
		let p = Object.values(content.web.players);
		setSelectedPlayerId(p[0].id)
		setPlayers(p);
	}, [ content, sageApi ])

	useEffect(() => {
		if (!players) return;
		if (players.length === 1) {
			setPlayerId(players[0].id);
		}
	}, [ players ])

	useEffect(() => {
		if (!projectConfig) return;
		if (!unityBuild) {
			let buildId = projectConfig.build;
			getUnityBuild(buildId).then(setUnityBuild);
		}
	}, [ unityBuild, projectConfig ])
			

	useEffect(() => {
		if (!content) return;
		if (!unityBuild) return;
		if (!playerId) return;
		let layoutOverride = layoutPresets;
		if (!layoutOverride || layoutOverride.length === 0) {
			layoutOverride = undefined; // TODO: empty layoutPresets should be undefined
		}
		let seed = Math.floor(Math.random() * 255);
		
		let players = [];
		let playerSettings = Object.values(content.web.players);
		for (let playerInfo of playerSettings) {
			players.push({
				id: playerInfo.id,
				index: playerInfo.index,

			})
		}

		setGame(new Game({
			unityBuild,
			content,
			actionLog: [{
				action: {
					type: 'init',
				}
			}],
			seed,
			layoutOverride,
			nfts,
			players,
			playerId,
		}))
	}, [ content, playerId, unityBuild, layoutPresets ])

	useEffect(() => {
		if (!game) return;
	}, [ game ])

	const onError = (err) => {
		console.log('onPlayPageError');
		console.log(err)
	}

	const onPlayerAction = useCallback((action) => {
		if (!game) return;
		console.log('onPlayerAction', action)
	}, [ game ]);

	const onPlayerChosen = () => {
		setPlayerId(selectedPlayerId);
	}

	if (players && !playerId) return <>
		<Select onChange={setSelectedPlayerId} defaultValue={selectedPlayerId}>
			{players.map(player => 
				<Option key={player.id} value={player.id}>
					{`Player ${player.index}`}
				</Option>
			)}
		</Select>
		<Button onClick={onPlayerChosen}>
			GO!
		</Button>
		</>
	if (!game) return <>Loading</>;
	return <GameProvider game={game}>
			<GameClient/>
		</GameProvider>;
}
