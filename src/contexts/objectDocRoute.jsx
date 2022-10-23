import React, { useEffect, useState } from 'react';
import { useProject } from './project';
import { useTemplate } from './template';
import { useParams, Outlet } from 'react-router-dom';
import { DocumentProvider } from './document';
import Document from '../content/document';

export function ObjectDocProvider(props) {
	const { objectId } = useParams();
	const { engine } = useProject();
	const { template } = useTemplate();
	const [doc, setDoc] = useState();

	useEffect(() => {
		if (!template) return;
		engine.template(template.code).object(objectId).get().then(res => {
			setDoc(new Document(template, res.fields));
		});
	}, [template, engine, objectId]);

	if (!doc) return <></>;
	return (
		<DocumentProvider doc={doc}>
			<Outlet />
		</DocumentProvider>
	);
}
