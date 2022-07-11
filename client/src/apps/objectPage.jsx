import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Template } from '../content/template';
import { useProject } from '../contexts/project';
import { useTemplate } from '../contexts/template';
import { useObject } from '../contexts/object';
import ObjectEditor from './objectEditor';
import { notify } from '../components/notification';
import { BrickTreeEditor } from '../content/types/brick/components';

export default function ObjectPage() {
	const { object } = useObject();
	const { template } = useTemplate();
	const navigate = useNavigate();
	const { sageApi } = useProject();
	const location = useLocation();

	const onSave = () => {
		console.log(location)
		notify({
			message: 'Object updated',
			description: `${object._id}`,
			color: '#DDFFDD',
		});
		navigate(`../../`); //Why do we go 2 levels upwards
	};
	return <ObjectEditor schema={template} object={object} onSave={onSave}>
		<Outlet/>
	</ObjectEditor>;
}
