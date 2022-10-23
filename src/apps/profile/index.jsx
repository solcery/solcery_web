import { useEffect, useState, useCallback } from 'react';
import { useProject } from '../../contexts/project';
import { useUser } from '../../contexts/user';
import DocumentEditor from '../document';
import Document from '../../content/document';
import { notify } from '../../components/notification';

const schema = {
	code: 'users',
	fields: [
		{ code: 'css', name: 'CSS', type: 'SString' },
		{ code: 'readonlyBricks', name: 'Show readonly bricks', type: 'SBool' },
		{ code: 'showBrickComments', name: 'Show brick comments', type: 'SBool' },
		{
			code: 'layoutPresets',
			name: 'Layout presets',
			type: 'SArray<SString>',
		},
		{ code: 'fastCopy', name: 'Open copied objects immediately', type: 'SBool' },
		{ code: 'doubleClickToOpenObject', name: 'Open objects with double click', type: 'SBool' },
		{ 
			code: 'nfts', 
			name: 'NFTS', 
			type: {
				name: "SArray",
				data: {
					valueType: {
						name: "SStruct",
						data: {
							fields: [
								{
									code: 'name',
									name: 'Name',
									type: 'SString',
								},
								{
									code: 'collection',
									name: 'Collection',
									type: {
										name: 'SLink',
										data: {
											project: 'nfts',
											templateCode: 'collections'
										}
									},
								},
								{
									code: 'image',
									name: 'Image',
									type: 'SImage',
								},
							]
						}
					}
				}
			} 
		},
	],
};

export default function Profile() {
	const { userId } = useUser();
	const [doc, setDoc] = useState(undefined);
	const { engine } = useProject();

	const reloadDoc = useCallback(() => {
		engine.user(userId).get().then(res => setDoc(new Document(schema, res.fields)));
	}, [ engine, userId] );

	useEffect(() => {
		reloadDoc();
	}, [reloadDoc]);

	const onSave = (fields) => {
		return engine.user(userId).update(fields).then(res => {
			notify({
				message: 'User updated',
				description: `${userId}`,
				type: 'success',
			});
			reloadDoc();
		});
	};

	if (!userId || !doc) return <></>;
	return <DocumentEditor doc={doc} onSave={onSave} />;
}
