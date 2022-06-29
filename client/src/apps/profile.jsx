import { useEffect, useState } from 'react';
import { Template } from '../content/template';
import { useProject } from '../contexts/project';
import { useUser } from '../contexts/user';
import ObjectEditor from './objectEditor';
import { notify } from '../components/notification';

export default function Profile() {
	const { id, reload } = useUser();
	const [user, setUser] = useState(undefined);
	const { sageApi } = useProject();

	const template = new Template({
		code: 'users',
		fields: [
			{ code: 'css', name: 'CSS', type: 'SString' },
			{ code: 'readonlyBricks', name: 'Show readonly bricks', type: 'SBool' },
			{
				code: 'layoutPresets',
				name: 'Layout presets',
				type: 'SArray<SString>',
			},
			{ code: 'fastCopy', name: 'Fast object copy', type: 'SBool' },
			{ code: 'doubleClickToOpenObject', name: 'Open objects with double click', type: 'SBool' },
		],
	});

	useEffect(() => {
		sageApi.user.getById({ id }).then(setUser);
	}, [sageApi.user, id]);

	const onSave = (fields) => {
		sageApi.user.update({ id, fields }).then((res) => {
			if (res.modifiedCount) {
				notify({
					message: 'User updated',
					description: `${id}`,
					color: '#DDFFDD',
				});
				reload();
			}
		});
	};
	return <ObjectEditor schema={template} object={user} onSave={onSave} />;
}
