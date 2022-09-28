import { useEffect, useState, useCallback, useRef } from 'react';
import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';
import { useAuth } from '../../contexts/auth';
import { Session } from '../../game';
import GameClient from '../../components/gameClient';
import { notify } from '../../components/notification';
import { SolceryAPIConnection } from '../../api';
import BasicGameClient from '../../components/basicGameClient';
import { Modal, Space, Button, Input, Spin, Tooltip } from 'antd';
import { SendOutlined } from '@ant-design/icons'
import { CloseIcon, BugIcon, QuestionMarkIcon, PlayIcon, HomeIcon, QuitIcon } from '../../components/icons';

import './walletModal.css';
import './style.scss';

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

const AMPLITUDE = 7;
const NEW_AMPLITUDE = 3;
const NFT_PANEL_WIDTH = 120;
const NFT_WIDTH = 20;
const MARGIN = 2;
const DELAY = 40;

const NFT_PANEL_WIDTH_PORTRAIT = 80;
const NFT_WIDTH_PORTRAIT = 30;

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
			<props.icon className='play'/>
		</div>
		{props.progressBarRef && <div ref={props.progressBarRef} className='loading'/>}
		{props.progressNumberRef && <div ref={props.progressNumberRef} className='loading-text'>Loading: 0%</div>}
	</div>;
}

const NftCard = (props) => {	

	let offset = Math.min((NFT_PANEL_WIDTH - NFT_WIDTH) / (props.total - 1), NFT_WIDTH + MARGIN);
	let offset_portrait = Math.min((NFT_PANEL_WIDTH_PORTRAIT - NFT_WIDTH_PORTRAIT) / (props.total - 1), NFT_WIDTH_PORTRAIT + MARGIN);
	let globalOffset = 0;
	let globalOffsetPortrait = 0;
	if (offset === NFT_WIDTH + MARGIN) {
		let requiredSpace = props.total * (NFT_WIDTH + MARGIN) - MARGIN;
		let remainingSpace = NFT_PANEL_WIDTH - requiredSpace;
		globalOffset = remainingSpace / 2;
	}

	if (offset_portrait === NFT_WIDTH_PORTRAIT + MARGIN) {
		let requiredSpacePortrait = props.total * (NFT_WIDTH_PORTRAIT + MARGIN) - MARGIN;
		let remainingSpacePortrait = NFT_PANEL_WIDTH_PORTRAIT - requiredSpacePortrait;
		globalOffsetPortrait = remainingSpacePortrait / 2;
	}
	
	let middleIndex = Math.floor(props.total / 2);
	let rotation = Math.floor((Math.random() * 2 - 1) * AMPLITUDE);
	let newRotation = Math.floor((Math.random() * 2 - 1) * NEW_AMPLITUDE);
	let animLength = DELAY * Math.abs(props.index - middleIndex);
	let style = {
		'--init-offset': (NFT_PANEL_WIDTH - NFT_WIDTH) / 2 + 'vh',
		'--rotation': rotation + 'deg',
		'--offset': props.index * offset + globalOffset + 'vh',
		'--offset-portrait': props.index * offset_portrait + globalOffsetPortrait + 'vw',
		'--transition-delay': DELAY * Math.abs(props.index - middleIndex) + 'ms',
		'--z-index': props.index + 10,
		'--new-rotation': newRotation + 'deg',
		cursor: props.url ? 'pointer' : 'auto',
	}

	return <a href={props.url} target='_blank' className={`card`} style={style} onClick={props.onClick}>
		<div className={'card-face'} style = {{'--rotation': -newRotation + 'deg'}}>
			<img src={props.image} className='nft-image' onLoad={props.onLoad}/>
			<div className='nft-name'>
				{props.name}
			</div>
		</div>
	</a>;
}

const NftBar = (props) => {
	const [ open, setOpen ] = useState(false);
	const ref = useRef();
	const loaded = useRef(0);
	const { gameInfo } = useGameApi();


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

	let nfts = props.nfts;
	let className = 'cards-split';
	if (open) className = className + ' transition';

	let text = `Your NFTs supported by ${gameInfo.gameName}:`;
	if (nfts.length === 0) {
		text = `No suitable NFTs found. Supported collections:`;
		nfts = gameInfo.supportedCollections;
	}

	const onLoad = () => {
		loaded.current += 1;
		if (loaded.current >= nfts.length) {
			delay(100).then(() => setOpen(true));
		}
	}

	return <div ref={ref} className={className}>
		<div className={'cards-header'}>
			{text}
		</div>
		{nfts.map((nft, index) => <NftCard 
				total={nfts.length}
				index={index}
				key={`nft_${index}`} 
				image={nft.image} 
				name={nft.name}
				url={nft.magicEdenUrl}
				onLoad={onLoad}
		/>)}	
		{props.nfts.length === 0 && <div></div>}
	 </div>;
}

const RulesIframe = (props) => {
	return <>
		<div className='popup-blackout' onClick={props.onClose}>
				<div className='popup-frame'>
					<div className='popup-title'>
						<CloseIcon className='popup-close' size='big' onClick={props.onClose}/>
						How to play
					</div>
					<iframe className='popup-rules-iframe' src={props.src}/>
				</div>

		</div>
	</>;
}

const BugReportPopup = (props) => {
	let [ sent, setSent ] = useState(false);
	let [ message, setMessage ] = useState(false);
	let [ contacts, setContacts ] = useState(false);
	const { gameApi } = useGameApi();
	const { publicKey } = usePlayer();

	const send = () => {
		if (!message) {
			notify({
				message: `No message`,
				description: "Please specify the problem you've encountered",
				type: 'warning',
			});
			return;
		}
		setSent(true);
		let payload = {
			publicKey,
			message,
			contacts,
		}
		gameApi.game.bugreport({ payload }).then(() => {
			notify({
				message: `Bug report sent`,
				description: 'Thank you for your feedback!',
				type: 'success',
			});
			props.onClose();
		})
	}

	return <Modal 
		title='Report a bug' 
		visible={props.visible}
		okText='Send'
		okButtonProps={{
			icon: <SendOutlined/>
		}}
		onOk={send}
		onCancel={props.onClose}
		onClose={props.onClose}
		>
		<Space style={{ width: '100%' }} direction='vertical'>
			Description
			<Input.TextArea 
				onChange={(e) => setMessage(e.target.value)}
				className='message'
				placeholder='Specify the problem for us'
			/>
			<Space/>
			Contact information (optional)
			<Input 
				className='contact'
				onChange={(e) => setContacts(e.target.value)}
				placeholder='Discord tag, email, etc'
			/>
			<Space/>
		</Space>
	</Modal>;
}

const Toolbar = (props) => {
	const [ showRules, setShowRules ] = useState(false);
	const [ showBugReport, setShowBugReport ] = useState(false);
	const { gameInfo } = useGameApi();
	const { publicKey, disconnect } = useAuth()

	let isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
	return <>
		{!isMobile && showRules && <RulesIframe src={gameInfo.rulesUrl} onClose={() => setShowRules(false)}/>}
		<BugReportPopup visible={showBugReport} onClose={() => setShowBugReport(false)}/>
		<div className='game-toolbar'>
			<div className='btn-toolbar' onClick={() => setShowBugReport(true)}>
				<BugIcon className='icon'/>
				<p className='btn-text'>Report a bug</p>
			</div>
			{gameInfo.rulesUrl && 
				isMobile ? 
				<a className='btn-toolbar' href={gameInfo.rulesUrl} target='_blank'>
					<QuestionMarkIcon size='big' className='icon'/>
					<p className='btn-text'>How to play</p>
				</a>
				: <div className='btn-toolbar' onClick={() => setShowRules(true)}>
					<QuestionMarkIcon size='big' className='icon'/>
				<p className='btn-text'>How to play</p>
			</div>}
			{props.gameReady && <div className='btn-toolbar' onClick={props.onLeaveGame}>
				<CloseIcon size='big' className='icon'/>
				<p className='btn-text'>Quit game</p>
			</div>}
			{!props.gameReady && publicKey && <div className='btn-toolbar' onClick={disconnect}>
				<QuitIcon size='big' className='icon'/>
				<p className='btn-text'>Sign out</p>
			</div>}
		</div>
	</>
}

const Menu = (props) => {
	const { gameApi, gameInfo } = useGameApi();
	const { AuthComponent } = useAuth();
	const { nfts, publicKey } = usePlayer();
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
			onError: props.onError
		});
		setGameSession(session);
		if (status === 'newgame') {
			props.onGameSession(session);
		}	
		session.start();
	}

	const continueGame = () => {
		props.onGameSession(gameSession);
	}

	useEffect(() => {
		if (!gameApi) return;
		if (!publicKey || !nfts) {
			if (playerNfts) {
				setPlayerNfts(undefined);
				setStatus('idle');
			}
			return;
		};
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
		<div className='bg' style={{ backgroundImage: `url(${gameInfo.lobbyBackground})` }}>
		 	<div className='game-header'>
				{gameInfo.gameName}
		 		<div className='game-subheader'>
		 			 {gameInfo.gameVersion}
		 		</div>
			</div>
		</div>
		{!publicKey && <div className='auth'>
			<div className='auth-header'>
				Login
			</div>
 			<AuthComponent/>
		</div>}
		{playerNfts && <NftBar nfts={playerNfts}/>}
		{playerNfts && <BigButton
			icon={PlayIcon}
			caption={status === 'newgame' ? 'Start' : 'Continue'} 
			onClick={status === 'newgame' ? createGame : continueGame} 
			progressBarRef={props.progressBarRef}
			progressNumberRef={props.progressNumberRef}
		/>}
	</div>;
}

export const GameTest = () => {
	const { gameApi, gameInfo } = useGameApi();
	const { publicKey } = usePlayer();
	const [ gameSession, setGameSession ] = useState();
	const [ gameReady, setGameReady ] = useState(false);
	const [ loadingProgress, setLoadingProgress ] = useState(0);
	const [ finished, setFinished ] = useState(false);
	const progressBarRef = useRef();
	const progressNumberRef = useRef();

	const onError = (err, gameId) => {
		if (gameSession) {
			gameId = gameSession.id;
		}
		let payload = {
			publicKey,
			gameId,
			message: err.message,
			error: err.data,
		}
		gameApi.game.bugreport({ payload }).then(() => {
			notify({
				message: `Fatal error`,
				description: 'Bug report automatically sent. Game cancelled.',
				type: 'error',
			});
			cancelGameOnError(gameId);
		})
	}

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

	const cancelGameOnError = (gameId) => {
		gameApi.game.leaveGame({ gameId }).then(reset)
	}

	const leaveGame = useCallback((gameId) => {
		if (!gameSession) return;
		let outcome = gameSession.outcome;
		if (!outcome && !window.confirm('Are you sure want to abandon current game?')) return;
		gameApi.game.leaveGame({ gameId: gameSession.id, outcome }).then(reset)
	}, [ gameSession ])

	return (<>
		<Toolbar onLeaveGame={leaveGame} gameReady={gameReady} gameSession={gameSession}/>
		{!gameReady && <Menu progressBarRef={progressBarRef} progressNumberRef={progressNumberRef} onGameSession={setGameSession} onError={onError}/>}
		<GameClient 
			unityBuild={gameInfo.build} 
			gameSession={gameSession} 
			onLoadingProgress={onLoadingProgress} 
			onFinished={() => setFinished(true)}
			onError={onError}
		/>
		{gameReady && finished && <div className='blackout'>
			<BigButton
				icon={HomeIcon}
				caption={'Back to menu'} 
				onClick={leaveGame}
			/>
		</div>}
	</>);
}