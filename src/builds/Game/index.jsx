import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// import { GameApiProvider } from '../../contexts/gameApi';
// import { ApiProvider } from '../../contexts/api';
// import { GameTest } from '../../apps/game';
import { TestPage } from '../../apps/test';

import './style.less';

export default function Game() {
	return (
			<BrowserRouter>
				<Routes>
					{/*<Route path=":projectId" element={<GameApiProvider/>}>
						<Route path="" element={<GameTest/>}/>
					</Route>
					<Route exact path="" element={<Navigate to="/eclipse" />}/>*/}
					<Route exact path="test" element={<TestPage/>}/>
				</Routes>
			</BrowserRouter>
	);
}
