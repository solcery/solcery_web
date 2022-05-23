import React from "react-dom";
import { TopMenu } from './components/TopMenu';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrickLibraryProvider } from './contexts/brickLibrary';
import './App.less';
import './App.css';

import TemplateObject from "./routes/templateObject";
import TemplateCollection from "./routes/templateCollection";
import Play from "./routes/play";
import Project from "./routes/project";

export default function App() {
	return (
		<>
			<h1>SAGE project: Eclipse</h1>
			<TopMenu style={{ backgroundColor: 'black' }}/>
			<BrickLibraryProvider>
				<BrowserRouter>
					<Routes>
						<Route path="template.:templateCode.:objectId" element={<TemplateObject />} />
						<Route path="template.:templateCode" element={<TemplateCollection />} />
						<Route path="play" element={<Play />} />
						<Route path="project" element={<Project />} />
					</Routes>
				</BrowserRouter>
			</BrickLibraryProvider>
		</>
	);
}