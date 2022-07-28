import { useEffect, useState } from 'react';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';

import contentWeb from './content_web.json';
import contentUnity from './content_unity.json';

export const GameTest = () => {
	const { publicKey, nfts } = usePlayer();
	const [ gameSession, setGameSession ] = useState();

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
		setGameSession(session)
	}

	useEffect(() => {
		if (!publicKey || !nfts) return;
		if (gameSession) return;
		newGame();
	}, [ publicKey, nfts ])

	if (!gameSession) return <>Loading</>;
	return (<GameClient gameSession={gameSession}/>);
}