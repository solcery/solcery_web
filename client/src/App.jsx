import React from "react-dom";
import { TopMenu } from './components/TopMenu'
import './App.less';
import './App.css';

export default function App() {
	return (
		<>
			<h1>SAGE project: Eclipse</h1>
			<TopMenu style={{ backgroundColor: 'black' }}/>
		</>
	);
}