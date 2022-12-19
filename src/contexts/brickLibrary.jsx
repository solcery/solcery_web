import React, { useContext, useEffect, useState, useCallback } from 'react';
import { BrickLibrary } from 'content/brickLib/brickLibrary';

const BrickLibraryContext = React.createContext(undefined);

export function BrickLibraryProvider(props) { // TODO
	const [ brickLibrary, setBrickLibrary ] = useState();
	const [ brickParams, setBrickParams ] = useState();

	useEffect(() => {
		setBrickLibrary(props.brickLibrary)
	}, [ props.brickLibrary ])

	useEffect(() => {
		setBrickParams(props.brickParams)
	}, [ props.brickParams ])

	return <BrickLibraryContext.Provider value={{ brickLibrary, brickParams }}>
		{props.children}
	</BrickLibraryContext.Provider>
}

export function useBrickLibrary() {
	const { brickLibrary, brickParams } = useContext(BrickLibraryContext);
	return { brickLibrary, brickParams };
}
 