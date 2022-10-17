import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SolceryAPI } from '../api';
import { BrickLibraryProvider } from './brickLibrary';
import { ContentProvider } from './content';
import { UserProvider } from './user';

const apiConfig = {
	url: 'err'
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
		let api = new SolceryAPI(projectId, apiConfig)
		setSageApi(api);
		api.project.getConfig().then(res => setProjectConfig(res.fields))
	}, [ projectId ]);

	return (
		<ProjectContext.Provider value={{ projectId, sageApi, setUserSession, projectConfig }}>
			<ContentProvider>
				<UserProvider>
					<BrickLibraryProvider>
						<Outlet />
					</BrickLibraryProvider>
				</UserProvider>
			</ContentProvider>
		</ProjectContext.Provider>
	);
}

export function useProject() {
	const { projectId, sageApi, setUserSession, projectConfig } = useContext(ProjectContext);
	return { projectId, sageApi, setUserSession, projectConfig };
}
