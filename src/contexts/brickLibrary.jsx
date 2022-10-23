import React, { useContext, useEffect, useState, useCallback } from 'react';
import { BrickLibrary } from '../content/brickLib/brickLibrary';
import { useProject } from './project';

const BrickLibraryContext = React.createContext(undefined);

export function BrickLibraryProvider(props) {
	// const [ revision ] = useState(0);
	const { engine } = useProject();
	const [brickLibrary, setBrickLibrary] = useState(undefined);

	const load = useCallback(async () => {
		let content = await engine.getContent({ objects: true, templates: true });
		let bl = new BrickLibrary(content);
		setBrickLibrary(bl.bricks);
	}, [ engine ]);

	useEffect(() => {
		load();
	}, [load]);

	return <BrickLibraryContext.Provider value={{ brickLibrary, load }}>{props.children}</BrickLibraryContext.Provider>;
}

export function useBrickLibrary() {
	const { brickLibrary, load } = useContext(BrickLibraryContext);
	return { brickLibrary, load };
}
