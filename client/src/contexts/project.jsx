import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { SageAPIConnection } from '../api';
import { BrickLibraryProvider } from './brickLibrary';
import { TopMenu } from '../components/TopMenu';
import { UserProvider } from './user';

const ProjectContext = React.createContext(undefined);

export function ProjectProvider(props) {
	let { projectName } = useParams();
	let [sageApi, setSageApi] = useState();

	const setUserSession = useCallback((session) => {
		sageApi.session = session;
	}, [ sageApi ])

	useEffect(() => {
		if (!projectName) return;
		document.title = `${projectName} - Sage`;
		setSageApi(new SageAPIConnection(projectName));
	}, [projectName]);

	return (
		<ProjectContext.Provider value={{ projectName, sageApi, setUserSession }}>
			<UserProvider>
				<BrickLibraryProvider>
					<TopMenu style={{ backgroundColor: 'black' }} />
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
