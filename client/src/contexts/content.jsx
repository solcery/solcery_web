import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useProject } from './project';

const ContentContext = React.createContext(undefined);

export function ContentProvider(props) {
	const { sageApi } = useProject();
	let [ cachedContent, setCachedContent ] = useState();
	let contentUpdating = useRef(false)

	useEffect(() => {
		if (!sageApi) return;
		contentUpdating.current = true;
		sageApi.project.getContent({ objects: true }).then(res => {
			setCachedContent(res);
			contentUpdating.current = false;
		})
	}, [ sageApi ]);

	const updateContent = useCallback(() => {
		if (contentUpdating.current) return;
		contentUpdating.current = true;
		sageApi.project.getContent({ objects: true }).then(res => {
			setCachedContent(res);
			contentUpdating.current = false;
		})
	}, [ sageApi ]);

	return (
		<ContentContext.Provider value={{ cachedContent, updateContent }}>
			{props.children}
		</ContentContext.Provider>
	);
}

export function useContent() {
	const [ content, setContent ] = useState();
	const { cachedContent, updateContent } = useContext(ContentContext);
	
	useEffect(() => {
		updateContent();
	}, []);

	useEffect(() => {
		setContent(cachedContent);
	}, [ cachedContent ]);

	return { content };
}
