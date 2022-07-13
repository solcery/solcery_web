import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useProject } from './project';
import { useTemplate } from './template';
import { useParams, Outlet } from 'react-router-dom';
import { SageAPIConnection } from '../api';
import { BrickLibraryProvider } from './brickLibrary';
import { TopMenu } from '../components/TopMenu';
import { UserProvider } from './user';
import { insertTable } from '../utils';

const DocumentContext = React.createContext(undefined);

export function DocumentProvider(props) {
	const [ doc, setDoc ] = useState(props.doc);

	return (
		<DocumentContext.Provider value={{ doc }}>
			{ props.children }
		</DocumentContext.Provider>
	);
}

export function useDocument() {
	const { doc } = useContext(DocumentContext);
	return { doc };
}
