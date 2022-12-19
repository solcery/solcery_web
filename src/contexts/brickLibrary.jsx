import React, { useContext } from 'react';
import { BrickLibrary } from 'content/brickLib/brickLibrary';

const BrickEditorContext = React.createContext(undefined);

export function BrickEditorProvider(props) { // TODO

	const { brickParams, brickLibrary, readonly } = props;
	
	return <BrickEditorContext.Provider value={{ brickParams, brickLibrary, readonly }}>
		{props.children}
	</BrickEditorContext.Provider>
}

export function useBrickEditor() {
	const { brickParams, brickLibrary, readonly } = useContext(BrickEditorContext);
	return { brickParams, brickLibrary, readonly };
}
 