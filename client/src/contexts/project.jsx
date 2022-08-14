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
	let { projectId } = useParams();
	let [sageApi, setSageApi] = useState();
	let [ projectConfig, setProjectConfig ] = useState();

	const setUserSession = useCallback(
		(session) => {
			sageApi.setSession(session);
		},
		[sageApi]
	);

	useEffect(() => {
		if (!projectConfig) return;
		document.title = `${projectConfig.projectName} - Sage`;
	}, [ projectConfig ])

	useEffect(() => {
		if (!projectId) return;
		let api = new SolceryAPIConnection(projectId, apiConfig)
		setSageApi(api);
		api.project.getConfig().then(res => setProjectConfig(res.fields))
	}, [ projectId ]);

	return (
		<ProjectContext.Provider value={{ projectId, sageApi, setUserSession, projectConfig }}>
			<UserProvider>
				<BrickLibraryProvider>
					<Outlet />
				</BrickLibraryProvider>
			</UserProvider>
		</ProjectContext.Provider>
	);
}

export function useProject() {
	const { projectId, sageApi, setUserSession, projectConfig } = useContext(ProjectContext);
	return { projectId, sageApi, setUserSession, projectConfig };
}
