import React from "react-dom";
import { TopMenu } from './components/TopMenu';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BrickLibraryProvider } from './contexts/brickLibrary';
import './App.less';
import './App.css';

import ObjectEditor from "./apps/objectEditor";
import CollectionEditor from "./apps/collectionEditor";
import TemplateUtils from "./apps/templateUtils";
import DeconstructSync from "./apps/deconstructSync";
import Play from "./apps/play";
import Project from "./apps/project";

export default function App() {
	return (
		<>
			<h1>SAGE project: Eclipse</h1>
			<TopMenu style={{ backgroundColor: 'black' }}/>
			<BrickLibraryProvider>
				<BrowserRouter>
					<Routes>
						<Route path="template.:templateCode.utils" element={<TemplateUtils />} />
						<Route path="template.:templateCode.:objectId" element={<ObjectEditor />} />
						<Route path="template.:templateCode" element={<CollectionEditor />} />
						<Route path="play" element={<Play />} />
						<Route path="project" element={<Project />} />
						<Route path="deconstructSync" element={<DeconstructSync />} />
					</Routes>
				</BrowserRouter>
			</BrickLibraryProvider>
		</>
	);
}