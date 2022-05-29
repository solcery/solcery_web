import { useUser } from '../contexts/user';
import ObjectEditor from './objectEditor';
import { notify } from '../components/notification';

export default function Profile() {
	const { id, reload } = useUser();

	const onSave = () => {
		reload(id);
		notify({
			message: 'Profile updated', 
			description: 'Changes are applied',
			color: '#DDFFDD'
		})
	}

	if (!id) return <></>;
	return <ObjectEditor 
		templateCode = { 'users' } 
		objectId = { id } 
		onSave = { onSave }
	/>;
}
