import { createRoot } from "react-dom/client";

import Sage from './builds/Sage';

let container = document.getElementById('root')
const root = createRoot(container);
root.render(<Sage/>);
