import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SolceryAPI } from '../api';
import { PlayerProvider } from './player';
import { AuthProvider } from './auth';
import { useApi } from './api';

const GameApiContext = React.createContext(undefined);

export function GameApiProvider(props) {
	let { projectId } = useParams();
	let { solceryAPI } = useApi();
	let [ status, setStatus ] = useState();
	let [ gameInfo, setGameInfo ] = useState();
	let [ gameApi, setGameApi ] = useState();
	let [ gameId, setGameId ] = useState(undefined);

	useEffect(() => {
		if (!projectId) return;
		setGameId(projectId)
	}, [ projectId ])

	useEffect(() => {
		if (!gameId) return;
		if (!solceryAPI) return;
		setGameApi(solceryAPI.game(gameId));
	}, [ gameId, solceryAPI ]);

	useEffect(() => {
		if (!gameApi) return;
		gameApi.getGameInfo().then(setGameInfo);
	}, [ gameApi])

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
