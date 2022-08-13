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
	const { id, reload } = useUser();
	const [doc, setDoc] = useState(undefined);
	const { sageApi } = useProject();

	const reloadDoc = useCallback(() => {
		sageApi.user.getById({ id }).then((res) => setDoc(new Document(schema, res.fields)));
	}, [sageApi.user, id]);

	useEffect(() => {
		reloadDoc();
	}, [reloadDoc]);

	const onSave = (fields) => {
		return sageApi.user.update({ id, fields }).then((res) => {
			if (res.modifiedCount) {
				notify({
					message: 'User updated',
					description: `${id}`,
					type: 'success',
				});
				reload();
				reloadDoc();
			}
		});
	};

	if (!id || !doc) return <></>;
	return <DocumentEditor doc={doc} onSave={onSave} />;
}
