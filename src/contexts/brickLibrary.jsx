import React, { useContext, useEffect, useState, useCallback } from 'react';
import { BrickLibrary } from '../content/brickLib/brickLibrary';
import { useProject } from './project';

const brickTypeColors = {
	default: '#261f1c',
	action: '#6D8BAC',
	condition: '#e8b463',
	value: '#788C7F',
	jsonKeyPair: '#6272a4',
	jsonToken: '#bd93f9',
}

function getBrickTypeStyle(brickType) {
	let backgroundColor = brickTypeColors.default;
	if (brickType && brickTypeColors[brickType]) {
		backgroundColor = brickTypeColors[brickType];
	}
	return { backgroundColor };
}

const BrickLibraryContext = React.createContext(undefined);

export function BrickLibraryProvider(props) {
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

	return <BrickLibraryContext.Provider value={{ getBrickTypeStyle, brickLibrary, load }}>
		{props.children}
	</BrickLibraryContext.Provider>;
}

export function useBrickLibrary() {
	const { brickLibrary, load, getBrickTypeStyle } = useContext(BrickLibraryContext);
	return { brickLibrary, load, getBrickTypeStyle };
}
