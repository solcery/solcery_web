import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SolceryAPI } from '../api';
import { PlayerProvider } from './player';
import { AuthProvider } from './auth';

const apiConfig = {
	url: 'https://solcery-server.herokuapp.com/api/',
}

const GameApiContext = React.createContext(undefined);

export function GameApiProvider(props) {
	let { projectId } = useParams();
	let [gameApi, setGameApi] = useState();
	let [ status, setStatus ] = useState();
	let [ gameInfo, setGameInfo ] = useState();
	let [ gameId, setGameId ] = useState(undefined);

	useEffect(() => {
		if (!projectId) return;
		setGameId(`game_${projectId}`)
	}, [ projectId ])

	useEffect(() => {
		if (!gameId) return;
		SolceryAPI.create(apiConfig).then(async (api) => {
			let gameInfo = await api.call('game.getGameInfo', { gameId });
			console.log(gameInfo)
			setGameInfo(gameInfo);
			setGameApi(api);
		});
	}, [ gameId ]);

	return (<GameApiContext.Provider value={{ gameInfo, gameApi, gameId }}>
		<AuthProvider>
			<PlayerProvider>
				<Outlet />
			</PlayerProvider>
		</AuthProvider>
	</GameApiContext.Provider>);
}

export function useGameApi() {
	const { gameApi, gameInfo, gameId } = useContext(GameApiContext);
	return { gameApi, gameInfo, gameId };
}
