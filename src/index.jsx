import { createRoot } from "react-dom/client";

const Empty = () => <>Empty</>;

let container = document.getElementById('root')
const root = createRoot(container);

root.render(<>Empty</>);

