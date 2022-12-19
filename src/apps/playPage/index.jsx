import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Game } from 'game';
import Unity, { UnityContext } from 'react-unity-webgl';
import { build } from 'content';
import { useUser } from 'contexts/user';
import { useProject } from 'contexts/project';
import { GameClient } from 'solcery_react_unity';
import { notif } from 'components/notification';
import { useApi } from 'contexts/api';
import { Switch } from 'antd';

import './style.scss';

export default function PlayPage() {
	const [ games, setGames ] = useState();
	const { layoutPresets, nfts } = useUser();
	const { engine } = useProject();
	const [ unityBuild, setUnityBuild ] = useState();
	const [ content, setContent ] = useState();
	const { solceryAPI } = useApi();
	const [ gameData, setGameData ] = useState();
	const [ currentStep, setCurrentStep ] = useState();
	let navigate = useNavigate()

	useEffect(() => { // Constructing content
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
 
	useEffect(() => { // loading build info
		if (!engine) return;
		if (!solceryAPI) return;
		if (unityBuild) return;
		engine.getConfig().then(config => {
			let buildId = config.build;
			solceryAPI.getUnityBuild(buildId).then(setUnityBuild);
		})
	}, [ engine, solceryAPI, unityBuild ])
			
	useEffect(() => { // Creating pseudo-server game
		if (!content) return;
		if (!unityBuild) return;
		if (layoutPresets && layoutPresets.length > 0) {
			content.web.gameSettings.layout = layoutPresets;
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
		let actionLog = [{ type: 'init' }];
		setGameData({
			id: 'LOCAL_GAME',
			players,
			actionLog,
			seed,
			content,
			unityBuild,
		})
	}, [ content, unityBuild, layoutPresets ])

	useEffect(() => { // Creating game sessions, registering onAction callbacks
		if (!gameData) return;
		if (games) return;
		let playerGames = [];
		for (let player of gameData.players) {
			let playerGameData = Object.assign({
				playerIndex: player.index,
			}, gameData);
			let playerGame = new Game(playerGameData);
			playerGames.push(playerGame);
		}
		setGames(playerGames);
	}, [ gameData ])

	useEffect(() => { // TODO
		if (!games) return;
		for (let game of games) {
			game.onAction = (action) => {
				if (!action.ctx) {
					action.ctx = {};
				}
				action.ctx.player_index = game.playerIndex;
				action.playerIndex = game.playerIndex; // ??
				gameData.actionLog.push(action);
				for (let g of games) {
					g.updateLog(gameData.actionLog);
				}
				setCurrentStep(gameData.actionLog.length - 1);
			}
		}
		setCurrentStep(0);
	}, [ games ])

	const setBotForGame = (index, value) => {
		games[index].setBotStatus(value);
	}

	const onUnityReady = (step) => {
		
		// console.log('onUnityReady', step)
		// let next = 0
		// if (step !== undefined) {
		// 	next = step + 1;
		// }
		// console.log(next)
		// if (next <= gameData.actionLog.length - 1) {
		// 	console.log('setting next', next)
		// 	setCurrentStep(next);
		// }
	}

	if (!games) return <></>;
	let gameClassName = 'debug-game-frame ' + (games.length > 1 ? 'multi' : 'single');
	return (<div className='debug-games-space'>
		{games.map((game, index) => <div key={`play.client.${index}`} className={gameClassName}>
			<div className='debug-game-debug-bar'>
				<p>Player Index: {game.playerIndex}</p>
				<Switch onChange={(value) => setBotForGame(index, value)}/>Bot
			</div>
			<GameClient 
				game={game} 
				onUnityReady={(step) => onUnityReady(step)}
				step={currentStep}
			/>
		</div>)}
	</div>);
}
