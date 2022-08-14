import { useEffect, useState, useCallback } from 'react';
import { useGameApi } from '../../contexts/gameApi';
import { useForge } from '../../contexts/forge';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Button } from 'antd';

import './style.css';
import './style.scss';

const NftCard = (props) => {
	return <div className="nft">
      <img className="nft-image" src={props.image} alt="" />
        <div className="nft-name">
          {props.name}
        </div>
    </div>;
}

const NftBar = (props) => {
	return <>
		<div className="collection">
	    {props.nfts.map((nft, index) => <NftCard key={`nft_${index}`} image={nft.image} name={nft.name}/>)}	
	    </div>
    </>;
}

const Menu = (props) => {
	const { gameApi } = useGameApi();
	const { forge } = useForge();
	const { nfts } = usePlayer();
	const [ forgedNfts, setForgedNfts ] = useState();
	const [ contentVersion, setContentVersion ] = useState();

	useEffect(() => {
		gameApi.game.getContentVersion().then(setContentVersion);
	}, [ gameApi ])

	useEffect(() => {
		if (!nfts) return;
		if (!contentVersion) return;
		if (!forge) return;
		forge.getNfts(nfts, contentVersion).then(setForgedNfts);
	}, [ forge, nfts, contentVersion ]);


	const createGame = useCallback(() => {
		if (!forgedNfts) return;
		let playerNfts = forgedNfts.map(nft => nft.mint);
		gameApi.game.startNewGame({ nfts: playerNfts }).then(props.onCreateGame)
	}, [ forgedNfts ])

	return <div className='menu-bg'>
		{forgedNfts && <NftBar nfts={forgedNfts}/>}
		{forgedNfts && <div className="start-button" onClick={createGame}>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			Start new game
		</div>}
	</div>
}

export const GameTest = () => {
	const { gameApi } = useGameApi();
	const [ log, setLog ] = useState([]);
	const [ step, setStep ] = useState(0);
	const [ gameSession, setGameSession ] = useState();
	const [ status, setStatus ] = useState();
	const { forge } = useForge();

	const loadGame = async (game) => {
		let contentVersionNumber = game.contentVersion;
		let contentVersion = await gameApi.game.getContentVersion({ contentVersion: contentVersionNumber })
		if (!contentVersion) return;
		let id = game._id;
		let nfts = game.nfts[0];
		nfts = await forge.getNfts(nfts, contentVersion);
		let content = contentVersion.content;
		let log = game.log;
		let seed = game.seed;
		let layoutPresets = [ 'core', 'EA' ]; // TODO: get from content
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

	const onCreateGame = (game) => {
		loadGame(game);
	}

	useEffect(() => {
		if (!gameApi) return;
		if (!forge) return;
		gameApi.game.getPlayerOngoingGame().then(game => {
			if (game === null) {
				setStatus('idle');
			} else { 
				loadGame(game);
			}
		})
	}, [ forge, gameApi ])

	const leaveGame = useCallback(() => {
		if (!gameSession) return;
		gameApi.game.leaveGame({ gameId: gameSession.id }).then(response => {
			setGameSession(undefined);
		})
	}, [ gameSession ])

	if (!status) return <>Loading</>;

	if (!gameSession) return <Menu onCreateGame={onCreateGame}/>;

	return (<>
		<a onClick={leaveGame} className="close-button"/>
		<div>
			<GameClient gameSession={gameSession}/>
		</div>
	</>);
}