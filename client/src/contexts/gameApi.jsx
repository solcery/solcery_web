import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SolceryAPIConnection } from '../api';
import { PlayerProvider } from './player';
import { AuthProvider } from './auth';

const apiConfig = {
	modules: [
		'game',
		'forge'
	],
	auth: './game/auth',
}

const GameApiContext = React.createContext(undefined);

export function GameApiProvider(props) {
	let { projectId } = useParams();
	let [gameApi, setGameApi] = useState();
	let [ status, setStatus ] = useState();
	let [ gameInfo, setGameInfo ] = useState();

	useEffect(() => {
		if (!projectId) return;
		let projectCode = `game_${projectId}`;
		let api = new SolceryAPIConnection(projectCode, apiConfig);
		api.game.getGameInfo().then(res => { // TODO: game info
			if (res) {
				setGameInfo(res);
				setGameApi(api);
				setStatus('ready');
			}
			else {
				setStatus('404');
			}
		});
	}, [ projectId ]);

	if (!status) return <>Loading...</>;
	if (status === '404') return <>No game found</>; //TODO: proper 404 redirect

	return (<GameApiContext.Provider value={{ gameApi, gameInfo }}>
		<AuthProvider>
			<PlayerProvider>
				<Outlet />
			</PlayerProvider>
		</AuthProvider>
	</GameApiContext.Provider>);
}

export function useGameApi() {
	const { gameApi, gameInfo } = useContext(GameApiContext);
	return { gameApi, gameInfo };
}
