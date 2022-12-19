import React, { useContext } from 'react';
import { BrickLibrary } from 'content/brickLib/brickLibrary';

const BrickEditorContext = React.createContext(undefined);

export function BrickLibraryProvider(props) { // TODO

	const { brickParams, brickLibrary, readonly } = props;
	
	return <BrickEditorContext.Provider value={{ brickParams, brickLibrary, readonly }}>
		{props.children}
	</BrickEditorContext.Provider>
}

export function useBrickLibrary() {
	const { brickParams, brickLibrary, readonly } = useContext(BrickEditorContext);
	return { brickParams, brickLibrary, readonly };
}
 