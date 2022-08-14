import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SolceryAPIConnection } from '../api';
import { PlayerProvider } from './player';
import { ForgeProvider } from './forge';

const apiConfig = {
	modules: [
		'game',
	],
	auth: './game/auth',
}

const GameApiContext = React.createContext(undefined);

export function GameApiProvider(props) {
	let { projectId } = useParams();
	let [gameApi, setGameApi] = useState();


	useEffect(() => {
		if (!projectId) return;
		document.title = `${projectId} - Solcery`;
		let projectCode = `game_${projectId}`;
		setGameApi(new SolceryAPIConnection(projectCode, apiConfig));
	}, [ projectId ]);

	return (
		<GameApiContext.Provider value={{ gameApi }}>
			<PlayerProvider>
				<ForgeProvider>
					<Outlet />
				</ForgeProvider>
			</PlayerProvider>
		</GameApiContext.Provider>
	);
}

export function useGameApi() {
	const { gameApi } = useContext(GameApiContext);
	return { gameApi };
}
