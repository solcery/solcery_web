import React, { useContext, useEffect, useState } from 'react';
import { useProject } from './project';
import { useParams, Outlet } from 'react-router-dom';
import { Template } from '../content/template';

const TemplateContext = React.createContext(undefined);

export function TemplateProvider(props) {
	let { templateCode } = useParams();
	let { engine } = useProject();
	let [template, setTemplate] = useState();
	useEffect(() => {
		engine.template(templateCode).getSchema().then(data => setTemplate(new Template(data)));
	}, [templateCode, engine]);

	if (template && template.code !== templateCode) return <></>;
	return (
		<TemplateContext.Provider value={{ template }}>
			<Outlet />
		</TemplateContext.Provider>
	);
}

export function useTemplate() {
	const { template } = useContext(TemplateContext);
	return { template };
}
