import { createRoot } from "react-dom/client";

// import Sage from './builds/Sage';
import Game from './builds/Game';

// const Empty = () => <>Empty</>;

let container = document.getElementById('root')
const root = createRoot(container);

// root.render(<Sage/>);
root.render(<Game/>);

