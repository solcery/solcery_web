import { useProject } from '../../../contexts/project';
import { useUser } from '../../../contexts/user';
import { Button } from 'antd';
import { notify } from '../../../components/notification';
import { useNavigate } from 'react-router-dom';

export const ActionsBar = (props) => {
	const { engine } = useProject();
	const { fastCopy } = useUser();
	const navigate = useNavigate();

	if (!engine) return;

	let object = props.object;
	let templateCode = props.templateCode;

	const copyObject = () => {
		engine.template(templateCode).object(object.id).clone().then(insertedId => {
			if (fastCopy) {
				navigate(`${insertedId}`);
			} else {
				notify({
					message: 'Object created',
					type: 'success',
					description: insertedId,
					url: `${templateCode}/${insertedId}`,
				});
			}
			if (props.onAction) {
				props.onAction();
			}
		});
	};
	const deleteObject = () => {
		if (window.confirm('Deleting object [' + object.id + '] ' + object.fields.title + '. Are you sure?')) {
			engine.template(templateCode).object(object.id).delete().then(res => {
				notify({
					message: 'Object deleted',
					type: 'success',
					description: object.id,
				});
				if (props.onAction) props.onAction();
			});
		}
	};
	return <>
		<Button onClick={copyObject}>
			Copy
		</Button>
		<Button onClick={deleteObject}>
			Delete
		</Button>
	</>;
}