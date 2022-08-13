import { useEffect, useState, useCallback } from 'react';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Button } from 'antd';

import './style.css';
import './style.scss';


const apiConfig = {
	modules: [
		'game',
	],
	auth: './game/auth',
}

const NftCard = (props) => {
	console.log(props.image)
	// return <div className='nft'>
	// 	<img className='nft-image' src={props.image}/>
	// 	<div className='nft-name'>{props.name}</div>
	// </div>;
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
	const { nfts, loadNfts } = usePlayer();
	const [ nftsRequested, setNftsRequested ] = useState(false)

	useEffect(() => {
		if (!loadNfts) return;
		if (!nfts) {
			if (nftsRequested) return;
			setNftsRequested(true)
			loadNfts();
			return;
		}
		console.log(nfts)
	}, [ nfts, loadNfts, nftsRequested ])




	return <div className='menu-bg'>
		{nfts && <NftBar nfts={nfts}/>}
		<div className="start-button" onClick={props.onCreateGame}>
			<span></span>
			<span></span>
			<span></span>
			<span></span>
			Start new game
		</div>
	</div>
}

export const GameTest = () => {
	const { publicKey, loadNfts } = usePlayer();
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

	if (!gameSession) return <Menu onCreateGame={createGame}/>;

	return (<>
		<a onClick={leaveGame} className="close-button"/>
		<div>
			<GameClient gameSession={gameSession}/>
		</div>
	</>);
}