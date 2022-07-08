import React, { useContext, useEffect, useState, useCallback } from 'react';

const HotkeyContext = React.createContext(undefined);

export function HotkeyProvider(props) {
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
		<HotkeyContext.Provider value={{}}>
			{props.children}
		</HotkeyContext.Provider>
	);
}

export function useProject() {
	const { } = useContext(HotkeyContext);
	return { };
}
