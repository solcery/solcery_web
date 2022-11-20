import { useGameApi } from '../../../contexts/gameApi';
import { usePlayer } from '../../../contexts/player';
import GameClient from '../../../components/gameClient';
import { Blackout } from '../../../components/blackout';
import { MenuButton } from '../../../components/menuButton';
import { Countdown } from '../../../components/countdown';
import { Game } from '../../../game';
import { Lobby } from '../lobby';
import { Button } from 'antd';
import { useEffect, useState } from 'react'

import './style.scss';

const LEAVE_TIMEOUT = 10;

export const Match = () => {
	const { match, publicKey, playerRequest } = usePlayer();
	const [ game, setGame ] = useState();
	const { gameApi } = useGameApi();
	const [ personalResult, setPersonalResult ] = useState();

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
        setGame(new Game(data));
        setPersonalResult();
	}

	const updateGame = (data) => {
		if (data.actionLog) {
			game.updateLog(data.actionLog);
			let pubkey = publicKey.toBase58();
			let gameFinished
			for (let action of data.actionLog) {
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

	if (game) return <>
		<div className='game-container'>
			<div className='game-frame'>
				<GameClient game={game}/>
			</div>
		</div>
		{personalResult && <Blackout
			header='Game over'
			message={message}
		>
			<Countdown total={LEAVE_TIMEOUT} caption='Returning to menu'/>
			<MenuButton onClick={() => abandonGame()}>Home</MenuButton>
		</Blackout>}
	</>;
}
