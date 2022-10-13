import { useProject } from '../../../contexts/project';
import { useUser } from '../../../contexts/user';
import { Button } from 'antd';
import { notify } from '../../../components/notification';
import { useNavigate } from 'react-router-dom';

export const ActionsBar = (props) => {
	const { sageApi } = useProject();
	const { fastCopy } = useUser();
	const navigate = useNavigate();

	if (!sageApi) return;

	let object = props.object;
	let templateCode = props.templateCode;

	const copyObject = () => {
		sageApi.template.cloneObject({
				template: templateCode,
				objectId: object.id,
			})
			.then((res) => {
				if (res.insertedId) {
					if (fastCopy) {
						navigate(`${res.insertedId}`);
					} else {
						notify({
							message: 'Object created',
							type: 'success',
							description: res.insertedId,
							url: `${templateCode}/${res.insertedId}`,
						});
					}
					if (props.onAction) {
						console.log('onAction')
						props.onAction();
					}
				}
			});
	};
	const deleteObject = () => {
		if (window.confirm('Deleting object [' + object.id + '] ' + object.fields.title + '. Are you sure?')) {
			sageApi.template.removeObjectById({
				template: templateCode,
				objectId: object.id,
			})
			.then(res => {
				if (res.deletedCount) {
					notify({
						message: 'Object deleted',
						type: 'success',
						description: object.id,
					});
					if (props.onAction) props.onAction();
				}
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