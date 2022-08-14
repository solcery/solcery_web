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
	let [ status, setStatus ] = useState();

	useEffect(() => {
		if (!projectId) return;
		let projectCode = `game_${projectId}`;
		let api = new SolceryAPIConnection(projectCode, apiConfig);
		api.game.getContentVersion().then(res => { // TODO: game info
			if (res) {
				document.title = `${projectId} - Solcery`;
				setStatus('ready');
			}
			else {
				document.title = `404 - Solcery`;
				setStatus('404');
			}
		});
		setGameApi(api);
	}, [ projectId ]);

	if (!status) return <>Loading...</>;
	if (status === '404') return <>No game found</>;

	return (<GameApiContext.Provider value={{ gameApi }}>
		<PlayerProvider>
			<ForgeProvider>
				<Outlet />
			</ForgeProvider>
		</PlayerProvider>
	</GameApiContext.Provider>);
}

export function useGameApi() {
	const { gameApi } = useContext(GameApiContext);
	return { gameApi };
}
