import React, { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useProject } from './project';
const md5 = require('js-md5'); 

const ContentContext = React.createContext(undefined);

export function ContentProvider(props) {
	const { engine } = useProject();
	let [ cachedContent, setCachedContent ] = useState();
	let contentHash = useRef(undefined);
	let contentUpdating = useRef(false);

	useEffect(() => {
		if (!engine) return;
		contentUpdating.current = true;
		engine.getContent({ objects: true, templates: true }).then(res => {
			setCachedContent(res);
			contentUpdating.current = false;
		})
	}, [ engine ]);

	const updateContent = useCallback(() => {
		if (contentUpdating.current) return;
		contentUpdating.current = true;
		engine.getContent({ objects: true, templates: true }).then(res => {
			let hash = md5(JSON.stringify(res)); // TODO: optimize
			if (hash != contentHash.current) {
				contentHash.current = hash
				setCachedContent(res);
			}
			contentUpdating.current = false;
		})
	}, [ engine ]);

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

	return { content, updateContent };
}
