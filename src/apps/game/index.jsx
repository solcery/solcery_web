import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';
import { useGame } from '../../contexts/game';
import GameClient from '../../components/gameClient';
import { HomeIcon } from '../../components/icons';
import { Menu } from './menu';

import './walletModal.css';
import './style.scss';

export const GameTest = () => {
	const { gameInfo } = useGameApi();
	const { game } = useGame();
	const { publicKey, status, request } = usePlayer();

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
		// 	notify({
		// 		message: `Fatal error`,
		// 		description: 'Bug report automatically sent. Game cancelled.',
		// 		type: 'error',
		// 	});
		// 	cancelGameOnError(gameId);
		// })
	}

	if (!gameInfo) return <></>;
	return (<>
		{/*<Toolbar onLeaveGame={leaveGame} gameReady={gameReady} gameSession={gameSession}/>*/}
		{!game && <Menu/>}
		{game && <GameClient/>}
		{/*{gameReady && finished && <div className='blackout'>
			<BigButton
				icon={HomeIcon}
				caption={'Back to menu'} 
				onClick={leaveGame}
			/>
		</div>}*/}
	</>);
}