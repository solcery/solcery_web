import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../contexts/project';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { useTemplate } from '../../contexts/template';
import { useDocument } from '../../contexts/document';
import DocumentEditor from '../document';
import { notif } from '../../components/notification';

export function ObjectPage() {
	const { objectId } = useParams();
	const { engine } = useProject();
	const { template } = useTemplate();
	const { load } = useBrickLibrary();
	const { doc } = useDocument();
	const navigate = useNavigate();

	const goUp = () => {
		navigate(`../../`); //Why do we go 2 levels upwards
	};

	const onExit = () => {
		goUp();
	};

	const onSave = (payload) => {
		engine.template(template.code).object(objectId).update(payload).then(res => {
			notif.success('Object updated', objectId);
			load();
			goUp();
		});
	};
	return <DocumentEditor 
		doc={doc} 
		onSave={onSave} 
		onExit={onExit} 
	/>;
}
