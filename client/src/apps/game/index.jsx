import { useEffect, useState, useCallback, useRef } from 'react';
import { useGameApi } from '../../contexts/gameApi';
import { useForge } from '../../contexts/forge';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Button, Spin } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

import './walletModal.css';
import './style.scss';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const AMPLITUDE = 7;
const NEW_AMPLITUDE = 3;
const NFT_PANEL_WIDTH = 1200;
const NFT_WIDTH = 200;
const MARGIN = 20;
const DELAY = 40;

const StartButton = (props) => {
	const [ clicked, setClicked ] = useState(false);

	const start = () => {
    setClicked(true);
		props.onClick && props.onClick();
  }

  let className = 'button-start';
  if (clicked) {
    className += ' success';
  }

	return <div onClick={start} className={className} href="#" role="button">
    <span className='label'>PLAY</span>
    <div className="icon">
      <CaretRightOutlined size='big' className='play'/>
      <Spin size='big' className='loading'/>
    </div>
  </div>;
}

const NftCard = (props) => {  

  let offset = Math.min((NFT_PANEL_WIDTH - NFT_WIDTH) / (props.total - 1), NFT_WIDTH + MARGIN);
  let globalOffset = 0;
  if (offset === NFT_WIDTH + MARGIN) {
    let requiredSpace = props.total * (NFT_WIDTH + MARGIN) - MARGIN;
    let remainingSpace = NFT_PANEL_WIDTH - requiredSpace;
    globalOffset = remainingSpace / 2;
  }
  
  let middleIndex = Math.floor(props.total / 2);
  let rotation = Math.floor((Math.random() * 2 - 1) * AMPLITUDE);
  let newRotation = Math.floor((Math.random() * 2 - 1) * NEW_AMPLITUDE);
  let animLength = DELAY * Math.abs(props.index - middleIndex);
  let style = {
    '--init-offset': (NFT_PANEL_WIDTH - NFT_WIDTH) / 2 + 'px',
    '--rotation': rotation + 'deg',
    '--offset': props.index * offset + globalOffset + 'px',
    '--transition-delay': DELAY * Math.abs(props.index - middleIndex) + 'ms',
    '--z-index': props.index + 10,
    '--new-rotation': newRotation + 'deg',
  }


  return <div className={`card`} style={style}>
    <div className={'card-face'} style = {{'--rotation': -newRotation + 'deg'}}>
      <img src={props.image} className='nft-image' onLoad={props.onLoad}/>
      <div className='nft-name'>
        {props.name}
      </div>
    </div>
  </div>;
}

const NftBar = (props) => {
  const [ open, setOpen ] = useState(false);
  const ref = useRef();
  const loaded = useRef(0);

  const onLoad = () => {
    loaded.current += 1;
    if (loaded.current === props.nfts.length) {
      delay(100).then(() => setOpen(true));
    }
  }

  useEffect(() => {
    if (!open) return;
    if (!props.nfts) return;
    delay(DELAY * props.nfts.length / 2).then(() => {
      if (ref.current) {
        ref.current.className += ' active';
      }
    });
  }, [ open, props.nfts ])

  let className = 'cards-split';
  if (open) className = className + ' transition';

  return <div ref={ref} className={className}>
  	<div className={'cards-header'}>
  		Your NFTs supported by Eclipse
  	</div>
      {props.nfts.map((nft, index) => <NftCard 
          total={props.nfts.length}
          index={index}
          key={`nft_${index}`} 
          image={nft.image} 
          name={nft.name}
          onLoad={onLoad}
      />)}  
    </div>;
}

const Menu = (props) => {
	const { gameApi, gameInfo } = useGameApi();
	const { forge } = useForge();
	const { nfts, publicKey, ConnectionComponent } = usePlayer();
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


	if (!gameInfo) return <>Loading</>;
	return <div className='game-menu'>
    <div className='bg' style={{ 'backgroundImage': `url(${gameInfo.lobbyBackground})` }}/>
   	<div className='game-header'>
      {gameInfo.gameName}
   		<div className='game-subheader'>
   			 {gameInfo.gameVersion}
   		</div>
    </div>
    {!publicKey && <div className='auth'>
    	<div className='auth-header'>
    		Login
    	</div>
 			{ConnectionComponent}
    </div>}
		{forgedNfts && <NftBar nfts={forgedNfts}/>}
		{forgedNfts && <StartButton onClick={createGame}/>}
	</div>;
}

export const GameTest = () => {
	const { gameApi } = useGameApi();
	const [ log, setLog ] = useState([]);
	const [ step, setStep ] = useState(0);
	const [ gameSession, setGameSession ] = useState();
	const [ status, setStatus ] = useState();
	const { forge } = useForge();
	const { publicKey } = usePlayer();

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
		let session = new Session({
			id,
			content,
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
		if (!publicKey) return;
		if (!forge) return;
		gameApi.game.getPlayerOngoingGame().then(game => {
			if (game === null) {
				setStatus('idle');
			} else { 
				loadGame(game);
			}
		})
	}, [ forge, gameApi, publicKey ])

	const leaveGame = useCallback(() => {
		if (!gameSession) return;
		if (!window.confirm('Are you sure want to abandon current game?')) return;
		gameApi.game.leaveGame({ gameId: gameSession.id }).then(response => {
			setGameSession(undefined);
		})
	}, [ gameSession ])

	if (!gameSession) return <Menu onCreateGame={onCreateGame}/>;

	return (<>
		<a onClick={leaveGame} className="button-close"/>
		<GameClient gameSession={gameSession}/>
	</>);
}