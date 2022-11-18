import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameApiProvider } from '../../contexts/gameApi';
import { HotkeyProvider } from '../../contexts/hotkey';
import { ApiProvider } from '../../contexts/api';
import { GameApp } from '../../apps/game';
// import { Lobby, Matchmaking, Login, Loading, Menu } from '../../apps/test';
import { AuthProvider } from '../../contexts/auth';

import './style.less';

export default function Game() {
	return (
		<HotkeyProvider>
			<AuthProvider>
				<ApiProvider>
					<BrowserRouter>
						<Routes>
							<Route path=":projectId" element={<GameApiProvider/>}>
								<Route path="" element={<GameApp/>}/>
							</Route>
							<Route exact path="eclipse" element={<Navigate to="/summoner" />}/>
							<Route exact path="" element={<Navigate to="/summoner" />}/>
						</Routes>
					</BrowserRouter>
				</ApiProvider>
			</AuthProvider>
		</HotkeyProvider>
	);
}
