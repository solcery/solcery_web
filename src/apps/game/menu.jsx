import { useState } from 'react';
import { NftBar } from './nftBar';
import { CloseIcon, BugIcon, QuestionMarkIcon, PlayIcon, HomeIcon, QuitIcon } from '../../components/icons';
import { useGameApi } from '../../contexts/gameApi';
import { usePlayer } from '../../contexts/player';
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


const GameMenu = (props) => {
	const { status, playerRequest } = usePlayer();

	const joinQueue = () => playerRequest({
		type: 'joinQueue'
	})

	const leaveQueue = () => playerRequest({
		type: 'leaveQueue'
	})
	
	if (!status) return;
	return <>
		{status.code === 'online' && <BigButton
			icon={PlayIcon}
			caption={'Find game'}
			onClick={joinQueue}
		/>}
		{status.code === 'queued' && <BigButton
			icon={PlayIcon}
			caption={'Cancel'}
			onClick={leaveQueue}
		/>}
	</>
}

export const Menu = (props) => {
	const { gameInfo } = useGameApi();
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
		<NftBar/>
		<GameMenu/>
	</div>;
}