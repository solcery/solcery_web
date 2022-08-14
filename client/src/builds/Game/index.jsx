import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameApiProvider } from '../../contexts/gameApi';
import { GameTest } from '../../apps/game';

import './style.less';

export default function Game() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path=":projectId" element={<GameApiProvider />}>
					<Route path="" element={<GameTest/>}/>
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
