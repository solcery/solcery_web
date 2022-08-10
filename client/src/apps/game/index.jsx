import { useEffect, useState, useCallback } from 'react';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Button } from 'antd';

import './style.css';

const apiConfig = {
	modules: [
		'game',
	],
	auth: './game/auth',
}

export const GameTest = () => {
	const { publicKey, nfts, loadNfts } = usePlayer();
	const [ log, setLog ] = useState([]);
	const [ step, setStep ] = useState(0);
	const [ gameSession, setGameSession ] = useState();
	const [ gameApi, setGameApi ] = useState();
	const [ status, setStatus ] = useState();

	const loadGame = async (game) => {
		let contentVersion = game.contentVersion;
		let cnt = await gameApi.game.getContentVersion({ contentVersion })
		if (!cnt) return;
		let id = game._id;
		let content = cnt.content;
		let nfts = game.nfts;
		let log = game.log;
		let seed = game.seed;
		let layoutPresets = [ 'core', 'tech demo', 'starting creatures' ];
		let session = new Session({
			id,
			content,
			layoutPresets,
			nfts,
			log,
			gameApi,
		});
		session.start();
		setGameSession(session);
		setStatus('ingame');
	}

	const createGame = async () => {
		let game = await gameApi.game.startNewGame()
		if (game) {
			loadGame(game)
		}
	}

	useEffect(() => {
		if (!publicKey) return;
		let api = new SolceryAPIConnection('game_eclipse', apiConfig);
		api.setSession(publicKey.toBase58());
		setGameApi(api); // TODO: config
	}, [ publicKey ]);

	useEffect(() => {
		if (!gameApi) return;
		gameApi.game.getPlayerOngoingGame().then(game => {
			if (game === null) {
				setStatus('idle');
			} else { 
				loadGame(game);
			}
		})
	}, [ gameApi ])

	const leaveGame = useCallback(() => {
		if (!gameSession) return;
		gameApi.game.leaveGame({ gameId: gameSession.id }).then(response => {
			setGameSession(undefined);
		})
	}, [ gameSession ])

	if (!status) return <>Loading</>;

	return (<>
		{!gameSession && <Button onClick={createGame}>START GAME</Button>}
		{gameSession && <a onClick={leaveGame} className="close-button"/>}
		<div>
			<GameClient gameSession={gameSession}/>
		</div>
	</>);
}