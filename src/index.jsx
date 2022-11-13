import { createRoot } from "react-dom/client";
import Sage from './builds/Sage';
import Game from './builds/Game';
require('./util')

let container = document.getElementById('root')
const root = createRoot(container);

if (process.env.REACT_APP_BUILD === 'Sage') {
	root.render(<Sage/>);
} else if (process.env.REACT_APP_BUILD === 'Game') {
	root.render(<Game/>);
} else {
	root.render(<>Empty</>);
}

