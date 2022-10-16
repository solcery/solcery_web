import { useState } from 'react';
import { NftBar } from './nftBar';
import { CloseIcon, BugIcon, QuestionMarkIcon, PlayIcon, HomeIcon, QuitIcon } from '../../components/icons';
import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';
import { useGame } from '../../contexts/game';
import { useAuth } from '../../contexts/auth';

import './walletModal.css';
import './style.scss';

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


export const Menu = (props) => {
	const { gameApi, gameInfo } = useGameApi();
	const { AuthComponent } = useAuth();
	const { nfts, publicKey, status, playerRequest } = usePlayer();
	const [ isNewGame, setIsNewGame ] = useState(true);
	const [ gameSession, setGameSession ] = useState();
	const [ playerNfts, setPlayerNfts ] = useState(undefined);

	const play = () => playerRequest({
		type: 'play'
	})
	

	if (!gameInfo) return <></>;
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
			<div className='auth-body'>
 				<AuthComponent/>
			</div>
		</div>}
		<NftBar nfts={playerNfts}/>
		{publicKey && <BigButton
			icon={PlayIcon}
			caption={status === 'newgame' ? 'Start' : 'Continue'} 
			progressBarRef={props.progressBarRef}
			progressNumberRef={props.progressNumberRef}
			onClick={play}
		/>}
	</div>;
}