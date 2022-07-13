import { useNavigate, useLocation, useParams, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Template } from '../content/template';
import { useProject } from '../contexts/project';
import { useBrickLibrary } from '../contexts/brickLibrary';
import { useTemplate } from '../contexts/template';
import { useDocument } from '../contexts/document';
import DocumentEditor from './documentEditor';
import { notify } from '../components/notification';
import { BrickTreeEditor } from '../content/types/brick/components';

export default function ObjectPage() {
	const { objectId } = useParams();
	const { sageApi } = useProject();
	const { template } = useTemplate();
	const { load } = useBrickLibrary();
	const { doc } = useDocument();
	const navigate = useNavigate();

	const goUp = () => {
		navigate(`../../`); //Why do we go 2 levels upwards	
	}

	const onExit = () => {
		goUp();
	}

	const onSave = (payload) => {
		sageApi.template.updateObjectById({ 
			template: template.code,
			objectId,
			fields: payload
		}).then(res => {
			if (res.modifiedCount === 1) {
				notify({
					message: 'Object updated',
					description: `${objectId}`,
					color: '#DDFFDD',
				});
				load();
				goUp();
			}
		})
	};
	return <DocumentEditor doc={doc} onSave={onSave} onExit={onExit}/>;
}
