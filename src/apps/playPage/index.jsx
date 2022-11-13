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
		let targets = [
			{
				name: 'web',
				format: 'web',
			},
			{
				name: 'unity_local',
				format: 'unity'
			},
			{
				name: 'bot',
				format: 'web',
			},
		];
		engine.getContent({ objects: true, templates: true }).then(raw => {
			let construction = build({
				targets,
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
			let buildId = config.build;
			solceryAPI.getUnityBuild(buildId).then(setUnityBuild);
		})
	}, [ engine, solceryAPI, unityBuild ])
			
	useEffect(() => {
		if (!content) return;
		if (!unityBuild) return;
		let layoutOverride = layoutPresets;
		if (!layoutOverride || layoutOverride.length === 0) {
			layoutOverride = undefined; // TODO: empty layoutPresets should be undefined
		}
		let seed = Math.floor(Math.random() * 255);
		let players = [];
		let playerSettings = Object.values(content.web.players);
		for (let playerInfo of playerSettings) {
			if (nfts) {
				var playerNfts = nfts.filter(nft => nft.player === playerInfo.index);
			}
			players.push({
				id: playerInfo.id,
				index: playerInfo.index,
				nfts: playerNfts,
			})
		};
		let actionLog = [
			{
				type: 'init',
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
				playerIndex: player.index,
			}, gameData);
			if (player.index > 1) {
				playerGameData.bot = true;
			}
			let playerGame = new Game(playerGameData);
			playerGames.push(playerGame);
		}
		setGames(playerGames);
	}, [ gameData ])

	useEffect(() => {
		if (!games) return;
		for (let game of games) {
			game.onAction = (action) => {
				if (!action.ctx) {
					action.ctx = {};
				}
				action.ctx.player_index = game.playerIndex;
				action.playerIndex = game.playerIndex;
				gameData.actionLog.push(action);
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
