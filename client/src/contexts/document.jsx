import React, { useContext, useRef } from 'react';

const DocumentContext = React.createContext(undefined);

export function DocumentProvider(props) {
	const doc = useRef(props.doc);

	return (
		<DocumentContext.Provider value={{ doc: doc.current }}>
			{ props.children }
		</DocumentContext.Provider>
	);
}

export function useDocument() {
	const { doc } = useContext(DocumentContext);
	return { doc };
}
