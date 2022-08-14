import { useNavigate, useParams } from 'react-router-dom';
import { useProject } from '../../contexts/project';
import { useBrickLibrary } from '../../contexts/brickLibrary';
import { useTemplate } from '../../contexts/template';
import { useDocument } from '../../contexts/document';
import DocumentEditor from '../document';
import { notify } from '../../components/notification';

export function ObjectPage() {
	const { objectId } = useParams();
	const { sageApi } = useProject();
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
		sageApi.template
			.updateObjectById({
				template: template.code,
				objectId,
				fields: payload,
			})
			.then(res => {
				console.log(res);
				if (res.modifiedCount === 1) {
					notify({
						message: 'Object updated',
						description: `${objectId}`,
						type: 'success',
					});
					load();
					goUp();
				}
			});
	};
	return <DocumentEditor 
		doc={doc} 
		onSave={onSave} 
		onExit={onExit} 
	/>;
}
