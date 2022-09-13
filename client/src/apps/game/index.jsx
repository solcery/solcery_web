import { useEffect, useState, useCallback, useRef } from 'react';
import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Button, Spin, Tooltip } from 'antd';
import { HomeOutlined, CloseOutlined, BugOutlined, CaretRightOutlined, QuestionOutlined } from '@ant-design/icons';


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

const BigButton = (props) => {
	const [ clicked, setClicked ] = useState(false);

	const onClick = () => {
    setClicked(true);
		props.onClick && props.onClick();
  }

  let className = 'button-big';
  if (clicked) {
    className += ' success';
  }

  const caption = props.caption;

	return <div onClick={onClick} className={className} href="#" role="button">
    <span className='label'>{props.caption}</span>
    <div className="icon">
    	<props.icon size='big' className='play'/>
    </div>
    {props.progressBarRef && <div ref={props.progressBarRef} className='loading'/>}
    {props.progressNumberRef && <div ref={props.progressNumberRef} className='loading-text'>Loading: 0%</div>}
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

  if (!props.nfts) return <></>;

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

const RulesIframe = (props) => {
	return <>
		<div className='blackout' onClick={props.onClose}>
			<div className='game-rules-body'>
				<div className='game-rules-title'>
					<CloseOutlined className='game-rules-close' size='big' onClick={props.onClose}/>
					How to play
				</div>
				<iframe className='game-rules-iframe' src='https://solcery.xyz'/>
			</div>
		</div>
	</>;
}

const Toolbar = (props) => {
	const [ showRules, setShowRules ] = useState(false);
	const { gameInfo } = useGameApi();

	return <>
		{showRules && <RulesIframe src={gameInfo.rulesURL} onClose={() => setShowRules(false)}/>}
		<div className='game-toolbar'>
			<div className='btn-toolbar'>
	    	<BugOutlined size='big' className='icon'/>
	    	<p className='btn-text'>Report a bug</p>
	    </div>
	    {gameInfo.rulesURL && <div className='btn-toolbar' onClick={() => setShowRules(true)}>
	    	<QuestionOutlined size='big' className='icon'/>
	    	<p className='btn-text'>How to play</p>
	    </div>}
	    {props.gameReady && <div className='btn-toolbar' onClick={props.onLeaveGame}>
	    	<CloseOutlined size='big' className='icon'/>
	    	<p className='btn-text'>Exit game</p>
	    </div>}
    </div>
	</>
}

const Menu = (props) => {
	const { gameApi, gameInfo } = useGameApi();
	const { nfts, publicKey, ConnectionComponent } = usePlayer();
	const [ isNewGame, setIsNewGame ] = useState(true);
	const [ gameSession, setGameSession ] = useState();
	const [ status, setStatus ] = useState('idle');
	const [ playerNfts, setPlayerNfts ] = useState();

	const loadGame = async (game) => {
		if (!game) return;
		let contentVersionNumber = game.contentVersion;
		let contentVersion = await gameApi.game.getContentVersion({ contentVersion: contentVersionNumber })
		if (!contentVersion) return;
		let id = game._id;
		let mints = game.nfts[0];
		let nfts = await gameApi.forge.getForgedNftsByMints({ mints });
		setPlayerNfts(nfts);
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

	useEffect(() => {
		if (!gameApi) return;
		if (!publicKey) return;
		if (!nfts) return;
		gameApi.game.getPlayerOngoingGame().then(game => {
			if (game) {
				setStatus('continue');
				loadGame(game)
			} else {
				gameApi.game.getContentVersion().then(contentVersion => {
					let supportedCollections = contentVersion.content.web.collections
      		let collectionFilter = Object.values(supportedCollections).map(col => col.collection);
      		setPlayerNfts(nfts.filter(nft => collectionFilter.includes(nft.collection)));
				})
				setStatus('newgame')
			}
		})
	}, [ nfts, gameApi, publicKey ])

	const createGame = useCallback(async () => {
		let gameNfts = playerNfts.map(nft => nft.mint); //TODO: filter
		gameApi.game.startNewGame({ nfts: gameNfts }).then(loadGame)
	}, [ nfts, playerNfts ]);

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
		{playerNfts && <NftBar nfts={playerNfts}/>}
		{playerNfts && <BigButton
			icon={CaretRightOutlined}
			caption={status === 'newgame' ? 'Start' : 'Continue'} 
			onClick={status === 'newgame' ? createGame : continueGame} 
			progressBarRef={props.progressBarRef}
			progressNumberRef={props.progressNumberRef}
		/>}
	</div>;
}

export const GameTest = () => {
	const { gameApi, gameInfo } = useGameApi();
	const [ gameSession, setGameSession ] = useState();
	const [ gameReady, setGameReady ] = useState(false);
	const [ loadingProgress, setLoadingProgress ] = useState(0);
	const [ finished, setFinished ] = useState(false);
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
		setFinished(false);
	}

	const leaveGame = useCallback(() => {
		if (!gameSession) return;
		let outcome = gameSession.outcome;
		if (!outcome && !window.confirm('Are you sure want to abandon current game?')) return;
		gameApi.game.leaveGame({ gameId: gameSession.id, outcome }).then(reset)
	}, [ gameSession ])

	return (<>
		<Toolbar onLeaveGame={leaveGame} gameReady={gameReady} gameSession={gameSession}/>
		{!gameReady && <Menu progressBarRef={progressBarRef} progressNumberRef={progressNumberRef} onGameSession={setGameSession}/>}
		<GameClient 
			unityBuild={gameInfo.build} 
			gameSession={gameSession} 
			onLoadingProgress={onLoadingProgress} 
			onFinished={() => setFinished(true)}
		/>
		{gameReady && gameSession.finished && <div className='blackout'>
			<BigButton
				icon={HomeOutlined}
				caption={'Back to menu'} 
				onClick={leaveGame}
			/>
		</div>}
	</>);
}