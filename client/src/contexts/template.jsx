import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useProject } from './project';
import { useParams, Outlet } from 'react-router-dom';
import { SageAPIConnection } from '../api';
import { BrickLibraryProvider } from './brickLibrary';
import { TopMenu } from '../components/TopMenu';
import { UserProvider } from './user';
import { Template } from '../content/template';

const TemplateContext = React.createContext(undefined);

export function TemplateProvider(props) {
	let { templateCode } = useParams();
	let { sageApi } = useProject();
	let [ template, setTemplate ] = useState()

	useEffect(() => {
		sageApi.template.getSchema({ template: templateCode }).then(data => setTemplate(new Template(data)));
	}, [ templateCode, sageApi ]);

	return (
		<TemplateContext.Provider value={{ template }}>
			<Outlet/>
		</TemplateContext.Provider>
	);
}

export function useTemplate() {
	const { template } = useContext(TemplateContext);
	return { template };
}
