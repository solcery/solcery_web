import React, { useContext, useEffect, useState, useCallback } from 'react';

const UnityContext = React.createContext(undefined);

export function UnityProvider(props) {
	const unityFrames = useRef([]);
	const [ revision, setRevision ] = useState(0);

	const createIframe = (target, iframeProps) => {
		let ref = React.createRef();
		let id = 1;
		let component = <iframe 
			key={id}
			ref={ref}
			src='/unity.html'
			scrolling='no'
			...iframeProps
		/>
		unityFrames.current.push({
			id,
			target,
			component,
			ref
		})
		setRevision(revision + 1);

	}

	return (
		<UnityContext.Provider value={{ createIframe }}>
			{props.children}
		</UnityContext.Provider>
	);
}

export function useUnity() {
	const { createIframe } = useContext(UnityContext);
	return { createIframe };
}
