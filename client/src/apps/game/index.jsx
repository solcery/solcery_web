import { useEffect, useState, useCallback } from 'react';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';

import contentWeb from './content_web.json';
import contentUnity from './content_unity.json';
// import { Button, Input, Card, Affix, Collapse } from 'antd';

// const { Panel } = Collapse;


class ServerEmulator {
	constructor(data = {}) {
		this.log = data.log ?? [];
	}

	async addLog(log) {
		function delay(ms) {
  			return new Promise(resolve => setTimeout(resolve, ms));
		}

		this.log = [ ...this.log, ...log];
		await delay(600);
		return this.log;
	}
}

const apiConfig = {
	modules: [
		'game',
	],
	auth: './game/auth',
}

export const GameTest = () => {
	const { publicKey, nfts, loadNfts } = usePlayer();
	const [ log, setLog ] = useState([]);
	const [ logSize, setLogSize ] = useState(0);
	const [ gameSession, setGameSession ] = useState();
	const [ gameApi, setGameApi ] = useState();

	const loadGame = (game) => {
		console.log('load game')
		console.log(game)

	}

	const createGame = () => {
		gameApi.game.startNewGame().then(game => {
			if (game) {
				console.log('startNewGame')
				console.log(game)
				loadGame(game)
			}
		})
	}

	useEffect(() => {
		if (!publicKey) return;
		let api = new SolceryAPIConnection('game_eclipse', apiConfig);
		api.setSession(publicKey.toBase58());
		setGameApi(api); // TODO: config
	}, [ publicKey ]);



	useEffect(() => {
		if (!gameApi) return;
		console.log('requestion')
		gameApi.game.getPlayerOngoingGame().then(game => {
			if (game === null) {
				console.log('no game found, creating new');
				createGame();
			} else { 
				loadGame(game)
			}
		})
	}, [ gameApi ])


	const newGame = () => {
		let content = {
			web: contentWeb,
			unity: contentUnity,
		}
		let layoutPresets = [ 'core', 'tech demo', 'starting creatures' ];
		let session = new Session({
			content,
			layoutPresets,
			nfts
		});
		session.start();
		setGameSession(session);
	}

	const onCommand = (command, gs) => {
		// serverEmulator
		// 	.addLog([command])
		// 	.then(newLog => {
		// 		console.log('New log from server: ', newLog);
		// 		setLogSize(newLog.length);
		// 		gs.updateLog(newLog);
		// 	});
	}

	useEffect(() => {
		if (gameSession && !gameSession.onCommand) {
			gameSession.onCommand = onCommand;
		}
	}, [ gameSession ])

	if (!gameSession) return <>Loading</>;
	return <BasicGameClient gameSession={gameSession} logSize={logSize}/>;
	// return (<GameClient gameSession={gameSession}/>);
}