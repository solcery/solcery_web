import React, { render } from "react-dom";
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";
import App from "./App";
import "./App.less"
import "./App.css"
import TemplateObject from "./routes/templateObject";
import TemplateCollection from "./routes/templateCollection";
import {} from './content'
// require('./loader.jsx'

const rootElement = document.getElementById("root");
render(
	<BrowserRouter>
		<App/>
		<Routes>
			<Route path="template.:templateCode.:objectId" element={<TemplateObject />} />
			<Route path="template.:templateCode" element={<TemplateCollection />} />
		</Routes>
	</BrowserRouter>,
	rootElement
);