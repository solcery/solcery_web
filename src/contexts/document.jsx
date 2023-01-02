import React, { useContext } from 'react';

const DocumentContext = React.createContext(undefined);

export function DocumentProvider(props) {
	return <DocumentContext.Provider value={{ doc: props.doc }}>{props.children}</DocumentContext.Provider>;
}

export function useDocument() {
	const { doc } = useContext(DocumentContext);
	return { doc };
}
