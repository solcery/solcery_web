import { useEffect, useState, useCallback, useRef } from 'react';
import { useGameApi } from '../../contexts/gameApi';
import { useForge } from '../../contexts/forge';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Button, Spin, Tooltip } from 'antd';
import { CloseOutlined, BugOutlined, CaretRightOutlined, QuestionOutlined } from '@ant-design/icons';

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

  const caption = props.status === 'continue' ? 'Continue' : 'New game';

	return <div onClick={start} className={className} href="#" role="button">
    <span className='label'>{caption}</span>
    <div className="icon">
      <CaretRightOutlined size='big' className='play'/>
    </div>
    <div ref={props.progressBarRef} className='loading'></div>
    <div ref={props.progressNumberRef} className='loading-text'>Loading: 0%</div>
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
  const { gameInfo } = useGameApi();

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

  let text = `Your NFTs supported by ${gameInfo.gameName}`;
  if (props.nfts.length === 0) {
  	text = `You have no NFTs supported by ${gameInfo.gameName}`
  }

  return <div ref={ref} className={className}>
  	<div className={'cards-header'}>
  		{text}
  	</div>
    {props.nfts.length > 0 && props.nfts.map((nft, index) => <NftCard 
        total={props.nfts.length}
        index={index}
        key={`nft_${index}`} 
        image={nft.image} 
        name={nft.name}
        onLoad={onLoad}
    />)}  
    {props.nfts.length === 0 && <div></div>}
   </div>;
}

const Rules = (props) => {
	return <>
		<div className='game-rules'>
			<iframe className='game-rules-iframe' src='https://docs.solcery.xyz/'/>
		</div>
	</>;
}

const Toolbar = () => {
	return <>
		<div className='game-toolbar'>
			<div className='btn-toolbar'>
	    	<BugOutlined size='big' className='icon'/>
	    	<p className='btn-text'>Report a bug</p>
	    </div>
	    <div className='btn-toolbar'>
	    	<QuestionOutlined size='big' className='icon'/>
	    	<p className='btn-text'>How to play</p>
	    </div>
	    <div className='btn-toolbar'>
	    	<CloseOutlined size='big' className='icon'/>
	    	<p className='btn-text'>Exit game</p>
	    </div>
    </div>
	</>
}

const Menu = (props) => {
	const { gameApi, gameInfo } = useGameApi();
	const { nfts, publicKey, ConnectionComponent } = usePlayer();
	const { forge } = useForge();
	const [ forgedNfts, setForgedNfts ] = useState();
	const [ isNewGame, setIsNewGame ] = useState(true);
	const [ gameSession, setGameSession ] = useState();
	const [ status, setStatus ] = useState('idle')

	const loadGame = async (game) => {
		if (!game) return;
		let contentVersionNumber = game.contentVersion;
		let contentVersion = await gameApi.game.getContentVersion({ contentVersion: contentVersionNumber })
		if (!contentVersion) return;
		let id = game._id;
		let nfts = game.nfts[0];
		nfts = await forge.getNfts(nfts, contentVersion);
		setForgedNfts(nfts);
		let content = contentVersion.content;
		let log = game.log;
		let seed = game.seed;
		let session = new Session({
			id,
			content,
			nfts,
			log,
			gameApi,
			seed,
		});
		session.start();
		setGameSession(session);
		if (status === 'newgame') {
			props.onGameSession(session);
		}
	}

	const continueGame = () => {
		props.onGameSession(gameSession);
	}

	const getPlayerForgedNfts = async () => {
		let contentVersion = await gameApi.game.getContentVersion();
		let playerNfts = await forge.getNfts(nfts, contentVersion);
		setForgedNfts(playerNfts)
	}

	useEffect(() => {
		if (!gameApi) return;
		if (!publicKey) return;
		gameApi.game.getPlayerOngoingGame().then(game => {
			if (game) {
				setStatus('continue');
				loadGame(game)
			} else {
				getPlayerForgedNfts();
				setStatus('newgame')
			}
		})
	}, [ gameApi, publicKey ])

	const createGame = useCallback(async () => {
		if (!forge) return;
		if (!forgedNfts) return;
		let playerNfts = forgedNfts.map(nft => nft.mint);
		gameApi.game.startNewGame({ nfts: playerNfts }).then(loadGame)
	}, [ forgedNfts ]);

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
		{forgedNfts && <StartButton
			status={status} 
			onClick={status === 'newgame' ? createGame : continueGame} 
			progressBarRef={props.progressBarRef}
			progressNumberRef={props.progressNumberRef}
		/>}
	</div>;
}

export const GameTest = () => {
	const { gameApi } = useGameApi();
	const [ gameSession, setGameSession ] = useState();
	const [ gameReady, setGameReady ] = useState(false);
	const [ loadingProgress, setLoadingProgress ] = useState(0);
	const progressBarRef = useRef();
	const progressNumberRef = useRef();

	const onLoadingProgress = (progress) => {

		if (progressBarRef.current) {
			progressBarRef.current.style.width = `${progress}%`;
		}
		if (progressNumberRef.current) {
			progressNumberRef.current.innerHTML = `Loading: ${progress}%`;
		}
		setGameReady(progress >= 100);
	}

	const reset = () => {
		setGameSession(undefined);
		setGameReady(false);
	}

	const leaveGame = useCallback(() => {
		if (!gameSession) return;
		if (!window.confirm('Are you sure want to abandon current game?')) return;
		gameApi.game.leaveGame({ gameId: gameSession.id }).then(reset)
	}, [ gameSession ])

	return (<>
		<Toolbar/>
		{/*<Rules/>*/}
		{!gameReady && <Menu progressBarRef={progressBarRef} progressNumberRef={progressNumberRef} onGameSession={setGameSession}/>}
		<GameClient gameSession={gameSession} onLoadingProgress={onLoadingProgress}/>
		{gameReady && <a onClick={leaveGame} className="button-close"/>}
	</>);
}