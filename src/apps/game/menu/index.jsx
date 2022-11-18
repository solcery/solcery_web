import { useState } from 'react';
import { useAuth } from '../../../contexts/auth';
import { useHotkey } from '../../../contexts/hotkey';
import { usePlayer } from '../../../contexts/player';
import { Button } from 'antd';
import { Blackout } from '../../../components/blackout';
import { MenuButton } from '../../../components/menuButton';

import './style.scss'

const MenuBurger = (props) => {
	let className = 'burger-menu-container';
	if (props.visible) {
		className = className + ' change';
	}
	return <div className={className}>
		<div className='nav-menu-button' onClick={props.onClick}>
			<div className="bar1"></div>
			<div className="bar2"></div>
			<div className="bar3"></div>
		</div>
		<div className='nav-menu-caption'>
			Esc
		</div>
	</div>;
}

export const Menu = (props) => {
	const [ visible, setVisible ] = useState(false);
	const { disconnect } = useAuth();
	const { status, playerRequest } = usePlayer();

	const changeVisibility = () => {
		setVisible(!visible);
	}
	useHotkey('Escape', changeVisibility);

	const leaveMatch = () => playerRequest({ 
		type: 'leaveMatch',
	})

	return <>
		{status && <MenuBurger onClick={changeVisibility} visible={visible}>Open menu</MenuBurger>}
		{visible && <Blackout header='Menu'>
			<MenuButton onClick={changeVisibility}>Close</MenuButton>
			{status && status.code === 'ingame' && <MenuButton onClick={leaveMatch}>Surrender</MenuButton>}
			<p/>
			<MenuButton onClick={disconnect}>Log out</MenuButton>
		</Blackout>}
	</>
}