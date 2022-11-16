import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { GameApiProvider } from '../../contexts/gameApi';
// import { ApiProvider } from '../../contexts/api';
// import { GameTest } from '../../apps/game';
import { Lobby, Matchmaking, Login, Loading } from '../../apps/test';
import { AuthProvider } from '../../contexts/auth';

import './style.less';

export default function Game() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					{/*<Route path=":projectId" element={<GameApiProvider/>}>
						<Route path="" element={<GameTest/>}/>
					</Route>
					<Route exact path="" element={<Navigate to="/eclipse" />}/>*/}
					<Route exact path="lobby" element={<Lobby/>}/>
					<Route exact path="matchmaking" element={<Matchmaking/>}/>
					<Route exact path="login" element={<Login/>}/>
					<Route exact path="loading" element={<Loading/>}/>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
}
