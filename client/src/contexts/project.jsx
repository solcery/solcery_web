import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SolceryAPIConnection } from '../api';
import { BrickLibraryProvider } from './brickLibrary';
import { UserProvider } from './user';

const apiConfig = {
	modules: [
		'project',
		'template',
		'user',
	],
	auth: './user/auth',
}

const ProjectContext = React.createContext(undefined);

export function ProjectProvider(props) {
	let { projectName } = useParams();
	let [sageApi, setSageApi] = useState();

	const setUserSession = useCallback(
		(session) => {
			sageApi.setSession(session);
		},
		[sageApi]
	);

	useEffect(() => {
		if (!projectName) return;
		document.title = `${projectName} - Sage`;
		setSageApi(new SolceryAPIConnection(projectName, apiConfig));
	}, [projectName]);

	return (
		<ProjectContext.Provider value={{ projectName, sageApi, setUserSession }}>
			<UserProvider>
				<BrickLibraryProvider>
					<Outlet />
				</BrickLibraryProvider>
			</UserProvider>
		</ProjectContext.Provider>
	);
}

export function useProject() {
	const { projectName, sageApi, setUserSession } = useContext(ProjectContext);
	return { projectName, sageApi, setUserSession };
}
