import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';

import { notif } from '../../components/notification';
import GameClient from '../../components/gameClient';
import { HomeIcon } from '../../components/icons';
import { Menu } from './menu';
import { Game } from '../../game';
import { Button } from 'antd';
import { useEffect, useState } from 'react'

import './walletModal.css';
import './style.scss';

const Match = () => {
	const { match, publicKey, playerRequest } = usePlayer();
	const [ game, setGame ] = useState();
	const { gameApi } = useGameApi();
	const [ leaveCountdown, setLeaveCountdown ] = useState();

	const leaveMatch = () => {
		playerRequest({ 
			type: 'leaveMatch',
		})
	}

	const sendAction = (action) => {
        playerRequest({
            type: 'action',
            data: action,
        });
    }

	const newGame = async (matchData) => {
		let data = {...matchData};
		let version = data.version;
        let res = await gameApi.getGameBuild(version);
        let myPlayerIndex = data.players.find(p => p.id === publicKey.toBase58()).index;
        data.content = res.content;
        data.unityBuild = res.unityBuild;
        data.onAction = sendAction;
        data.playerIndex = myPlayerIndex;
        setGame(new Game(data));
	}

	const updateGame = (data) => {
		if (data.actionLog) {
			game.updateLog(data.actionLog);
			let pubkey = publicKey.toBase58();
			let gameFinished
			for (let action of data.actionLog) {
				if (action.type === 'leaveMatch' && action.player === pubkey) {
					gameFinished = true;
					break;
				}
			}
			gameFinished = gameFinished ?? game.gameState.getResult();
			if (gameFinished) {
				setLeaveCountdown(10);
				// If left game or game finished - blackout and exit timer
			}
		}
	}

	useEffect(() => {
		if (!match) return;
		if (!match.id) return; //Ignore match update without Id
		if (!game) {
			if (match.started) newGame(match);
			return;
		}
		if (game.id !== match.id) return; //TODO: ??
		updateGame(match);
	}, [ match ]);

	useEffect(() => {
		if (leaveCountdown === undefined) return;
		if (leaveCountdown > 0) {
			setTimeout(() => setLeaveCountdown(leaveCountdown - 1), 1000);
			return;
		}
    	setGame();
    	setLeaveCountdown();
  	}, [ leaveCountdown ]);

	return <>
		{game && <div className='game-frame'>
			<div className='game-container'>
				<GameClient game={game}/>
			</div>
		</div>}
		{game && <Button onClick={leaveMatch}>LEAVE</Button>}
		{leaveCountdown !== undefined && <div className='blackout'>
			<p>Game Ended</p>
			<p>{leaveCountdown}</p>
			<Button onClick={() => setGame()}>BACK</Button>
		</div>}
	</>
}


export const GameTest = () => {
	const { gameInfo } = useGameApi();
	const { publicKey, status, playerRequest, match } = usePlayer();

	

	if (!gameInfo) return <></>;
	return (<>
		{/*<Toolbar onLeaveGame={leaveGame} gameReady={gameReady} gameSession={gameSession}/>*/}
		<Menu/>
		<Match/>
	</>);
}

	// const onError = (err, gameId) => {
	// 	// if (gameSession) {
	// 	// 	gameId = gameSession.id;
	// 	// }
	// 	// let payload = {
	// 	// 	publicKey,
	// 	// 	gameId,
	// 	// 	message: err.message,
	// 	// 	error: err.data,
	// 	// }
	// 	// gameApi.game.bugreport({ payload }).then(() => {
	// 	// 	notif.error('Fatal error', 'Bug report automatically sent. Game cancelled');
	// 	// 	cancelGameOnError(gameId);
	// 	// })
	// }