import React, { useEffect, useState } from 'react';
import { useProject } from './project';
import { useTemplate } from './template';
import { useParams, Outlet } from 'react-router-dom';
import { DocumentProvider } from './document';
import Document from '../content/document';

export function ObjectDocProvider(props) {
	const { objectId } = useParams();
	const { sageApi } = useProject();
	const { template } = useTemplate();
	const [doc, setDoc] = useState();

	useEffect(() => {
		if (!template) return;
		sageApi.template.getObjectById({ template: template.code, objectId }).then((res) => {
			setDoc(new Document(template, res.fields));
		});
	}, [template, sageApi, objectId]);

	if (!doc) return <></>;
	return (
		<DocumentProvider doc={doc}>
			<Outlet />
		</DocumentProvider>
	);
}
