import { useGameApi } from '../../../contexts/gameApi';
import { usePlayer } from '../../../contexts/player';
import GameClient from '../../../components/gameClient';
import { Blackout } from '../../../components/blackout';
import { MenuButton } from '../../../components/menuButton';
import { Countdown } from '../../../components/countdown';
import { Game } from '../../../game';
import { Lobby } from '../lobby';
import { Button } from 'antd';
import { useEffect, useState, useRef, useCallback } from 'react'

import './style.scss';

const LEAVE_TIMEOUT = 10;

export const Match = () => {
	const { match, status, publicKey, playerRequest } = usePlayer();
	const [ game, setGame ] = useState();
	const { gameApi } = useGameApi();
	const [ personalResult, setPersonalResult ] = useState();
	const [ afkTimeout, setAfkTimeout ] = useState();
	const [ newLog, setNewLog ] = useState();
	const serverTime = useRef();

	const onGameStateConfirmed = (step) => {
		if (step >= game.actionLog.length - 1) {
			updateLeaveGame();
		}
	}

	const onLogUpdate = (log) => {
		updateAfk();
	}

	const sendAction = (action) => {
        playerRequest({
            type: 'action',
            data: action,
        });
    }

    const abandonGame = () => {
    	setGame();
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
        setPersonalResult();
        setGame(new Game(data));
	}

	const updateLeaveGame = () => {
		let pubkey = publicKey.toBase58();
		let gameFinished
		for (let action of game.actionLog) {
			if (action.type === 'leaveMatch' && action.player === pubkey) {
				setPersonalResult('surrender')
				return;
			}
		}
		let result = game.gameState.getResult();
		if (result) {
			let playerData = game.players.find(player => player.id = pubkey);
			if (playerData) {
				if (result.playerScore[playerData.index] > 0) {
					setPersonalResult('victory');
					return;
				}
			}
			setPersonalResult('defeat');
		}
	}

	const updateAfk = () => {
		let pubkey = publicKey.toBase58();
	    let myPlayer = game.players.find(player => player.id === pubkey);
	    if (!myPlayer) return;
	    let myIndex = myPlayer.index;
	    let myPlayerSettings = Object.values(game.content.web.players).find(player => player.index === myIndex);
	    if (!myPlayerSettings) return; 
	    if (!myPlayerSettings.afkTimeout) return;
	    if (!myPlayerSettings.afkLastActionTime) return;
	    let ctx = game.gameState.createContext();
	    let runtime = game.gameState.getRuntime();
	    let timeout = runtime.execBrick(myPlayerSettings.afkTimeout, ctx);
	    let lastActionTime = runtime.execBrick(myPlayerSettings.afkLastActionTime, ctx);
	    if (timeout <= 0) {
	    	setAfkTimeout();
	    } else {
	    	let serverGameTime = serverTime.current - game.started;
	    	setAfkTimeout({
	    		total: Math.floor((timeout - lastActionTime) / 1000),
	    		current: Math.floor((timeout - serverGameTime) / 1000),
	    	})
	    }
	}

	useEffect(() => {
		if (!status) return;
		if (!match) return;
		serverTime.current = match.time;
		if (!match.id) return; //Ignore match update without Id
		if (!game) {	
			if (!match.started)	return;
			if (status.code !== 'ingame') return;
			if (status.data.matchId !== match.id) return;
			newGame(match);
			return;
		}
		if (game.id !== match.id) return;
		if (!game.onLogUpdate.includes(onLogUpdate)) {
			game.onLogUpdate.push(onLogUpdate)
		}
		if (match.actionLog.length > game.actionLog.length) {
			game.updateLog(match.actionLog);
		}
	}, [ match, game, status ]);

	useEffect(() => {
		if (!personalResult) return;
		let timeout = setTimeout(() => abandonGame(), (LEAVE_TIMEOUT + 1) * 1000);
		return () => clearTimeout(timeout);
	}, [ personalResult ])

	let message;
	switch (personalResult) { // TODO: draw
		case 'surrender':
			message = 'You have left the match.';
			break;
		case 'victory':
			message = 'You have won. Congratulations!';
			break;
		case 'defeat':
			message = 'You have lost. Better luck next time!';
			break;
		default:
			message = 'Match had been finished';
			break;
	}

	if (!game) return <Lobby/>;
	return <>
		{afkTimeout && <div className='timeout-popup fade-in'>
			<Countdown 
				total={afkTimeout.total} 
				current={afkTimeout.current}
				caption='Time left'
			/>
		</div>}
		<div className='game-container'>
			<div className='game-frame'>
				<GameClient 
					game={game}
					onGameStateConfirmed={onGameStateConfirmed}
				/>
			</div>
		</div>
		{personalResult && <Blackout
			header='Game over'
			message={message}
		>
		<Countdown 
			total={LEAVE_TIMEOUT} 
			current={LEAVE_TIMEOUT} 
			caption='Returning to menu'
		/>
		<MenuButton onClick={() => abandonGame()}>Home</MenuButton>
		</Blackout>}
	</>;
}
