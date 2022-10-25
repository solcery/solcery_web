import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from '../../game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { build } from '../../content';
import { useUser } from '../../contexts/user';
import { useProject } from '../../contexts/project';
import { GameProvider } from '../../contexts/game';
import GameClient from '../../components/gameClient';
import { notif } from '../../components/notification';
import { useApi } from '../../contexts/api';

import './style.css';

export default function PlayPage() {
	const [ games, setGames ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { engine } = useProject();
	const [ unityBuild, setUnityBuild ] = useState();
	const [ content, setContent ] = useState();
	const { solceryAPI } = useApi();
	const [ gameData, setGameData ] = useState();
	let navigate = useNavigate()

	useEffect(() => {
		if (!engine) return;
		if (content) return;
		engine.getContent({ objects: true, templates: true }).then(raw => {
			let construction = build({
				targets: ['web', 'unity_local'],
				content: raw,
			});
			if (!construction.status) {
				notif.error('Error', 'Content is not valid');
				navigate('../validator');
			}
			construction.constructed.unity = construction.constructed.unity_local;
			setContent(construction.constructed);
		});
	}, [ content, engine ])

	useEffect(() => {
		if (!engine) return;
		if (!solceryAPI) return;
		if (unityBuild) return;
		engine.getConfig().then(config => {
			let buildId = config.fields.build;
			solceryAPI.system().getUnityBuild(buildId).then(setUnityBuild);
		})
	}, [ engine, solceryAPI, unityBuild ])
			
	useEffect(() => {
		if (!content) return;
		if (!unityBuild) return;
		console.log('content: ', content)
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

		let actionLog = [
			{
				action: {
					type: 'init',
				}
			}
		];
		setGameData({
			id: 'LOCAL_GAME',
			players,
			actionLog,
			seed,
			content,
			unityBuild,
			layoutOverride,
		})
	}, [ content, unityBuild, layoutPresets ])

	useEffect(() => {
		if (!gameData) return;
		if (games) return;
		let playerGames = [];
		for (let player of gameData.players) {
			let playerGameData = Object.assign({
				playerId: player.id, // TODO: add nfts
			}, gameData);
			let playerGame = new Game(playerGameData);
			playerGames.push(playerGame);
		}
		setGames(playerGames);
	}, [ gameData ])

	useEffect(() => {
		if (!games) return;
		for (let game of games) {
			game.onAction = (action) => {
				let cmd = {
					playerId: game.playerId,
					action,
				}
				gameData.actionLog.push(cmd);
				for (let g of games) {
					g.updateLog(gameData.actionLog);
				}
			}
		}
	}, [ games ])

	if (!games) return <></>;
	let gameClassName = 'game-frame ' + (games.length > 1 ? 'multi' : 'single');
	return (<div className='games-space'>
		{games.map((game, index) => <div className={gameClassName}>
			<GameProvider game={game}> 
				<GameClient/>
			</GameProvider>
		</div>)}
	</div>);
}
