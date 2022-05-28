import { useUser } from '../contexts/user';
import ObjectEditor from './objectEditor';

export default function Profile() {
	const { id, reload } = useUser();
	if (!id) return <></>;
	return <ObjectEditor templateCode={'users'} objectId={id} onSave={() => { reload(id) }}/>
}
