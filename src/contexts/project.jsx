import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { BrickLibraryProvider } from './brickLibrary';
import { ContentProvider } from './content';
import { UserProvider } from './user';
import { AuthProvider } from './auth';
import { useApi } from './api';

const apiConfig = {
	url: 'https://create.solcery.xyz/api/',
	modules: [
		'project',
		'template',
		'user'
	],
}

const ProjectContext = React.createContext(undefined);

export function ProjectProvider(props) {
	let { solceryAPI } = useApi();
	let { projectId } = useParams();
	let [ engine, setEngine ] = useState();

	useEffect(() => {
		if (!projectId) return;
		if (!solceryAPI) return;
		setEngine(solceryAPI.engine(projectId));
	}, [ solceryAPI, projectId ]);

	useEffect(() => {
		if (!engine) return;
		engine.getConfig().then(res => {
			document.title = `${res.fields.projectName} - Sage`
		});
	}, [ engine ])


	return (
		<ProjectContext.Provider value={{ projectId, engine }}>
			<UserProvider>
				<ContentProvider>
					<BrickLibraryProvider>
						<Outlet />
					</BrickLibraryProvider>
				</ContentProvider>
			</UserProvider>
		</ProjectContext.Provider>
	);
}

export function useProject() {
	const { projectId, engine } = useContext(ProjectContext);
	return { projectId, engine };
}
