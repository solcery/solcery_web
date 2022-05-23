import React, { render } from "react-dom";
import {
	BrowserRouter,
	Routes,
	Route,
} from "react-router-dom";
import App from "./App";
import "./App.less"
import "./App.css"
import Play from "./routes/play";

const rootElement = document.getElementById("root");
render(
	<BrowserRouter>
		<Play/>
	</BrowserRouter>,
	rootElement
);