import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';
import { useGame } from '../../contexts/game';

import { notif } from '../../components/notification';
import GameClient from '../../components/gameClient';
import { HomeIcon } from '../../components/icons';
import { Menu } from './menu';
import { Button } from 'antd';

import './walletModal.css';
import './style.scss';

export const GameTest = () => {
	const { gameInfo } = useGameApi();
	const { game } = useGame();
	const { publicKey, status, playerRequest } = usePlayer();

	const leave = () => {
		playerRequest({ 
			type: 'leaveMatch',
		})
	}

	const onError = (err, gameId) => {
		// if (gameSession) {
		// 	gameId = gameSession.id;
		// }
		// let payload = {
		// 	publicKey,
		// 	gameId,
		// 	message: err.message,
		// 	error: err.data,
		// }
		// gameApi.game.bugreport({ payload }).then(() => {
		// 	notif.error('Fatal error', 'Bug report automatically sent. Game cancelled');
		// 	cancelGameOnError(gameId);
		// })
	}

	if (!gameInfo) return <></>;
	return (<>
		{/*<Toolbar onLeaveGame={leaveGame} gameReady={gameReady} gameSession={gameSession}/>*/}
		{!game && <Menu/>}
		{game && <div className='game-frame'>
			<div className='game-container'>
				<GameClient/>
			</div>
		</div>}
		{game && <Button onClick={leave}>LEAVE</Button>}
		{/*{gameReady && finished && <div className='blackout'>
			<BigButton
				icon={HomeIcon}
				caption={'Back to menu'} 
				onClick={leaveGame}
			/>
		</div>}*/}
	</>);
}