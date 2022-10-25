import { useProject } from '../../../contexts/project';
import { useUser } from '../../../contexts/user';
import { Button } from 'antd';
import { notif } from '../../../components/notification';
import { useNavigate } from 'react-router-dom';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';

export const ActionsBar = (props) => {
	const { engine } = useProject();
	const { fastCopy } = useUser();
	const navigate = useNavigate();


	if (!engine) return;

	let object = props.object;
	let templateCode = props.templateCode;


	const clone = async () => {
		let insertedId = await engine.template(templateCode).object(object.id).clone();
		if (!insertedId) return;
		if (fastCopy) {
			navigate(`${insertedId}`);
		} else {
			notif.success('Object created', insertedId, `${templateCode}/${insertedId}`)
		}
		if (props.onAction) {
			props.onAction();
		}
	};
	const deleteObject = async () => {
		if (!window.confirm('Deleting object [' + object.id + '] ' + (object.fields.name ?? '') + '. Are you sure?')) return
		let res = await engine.template(templateCode).object(object.id).delete();
		if (!res) return;
		notif.success('Object deleted', object.id);
		if (props.onAction) props.onAction();
	};
	return <>
		<Button icon={<CopyOutlined/>} onClick={clone}>
			Clone
		</Button>
		<Button icon={<DeleteOutlined/>} onClick={deleteObject}>
			Delete
		</Button>
	</>;
}