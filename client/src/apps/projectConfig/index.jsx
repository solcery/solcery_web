import { useEffect, useState, useCallback } from 'react';
import { useProject } from '../../contexts/project'
import DocumentEditor from '../document';
import Document from '../../content/document';
import { notify } from '../../components/notification';

const schema = {
	code: 'projectConfig',
	fields: [
		{ code: 'projectName', name: 'Project name', type: 'SString', readonly: true },
		{ 
			code: 'sync',
			name: 'Sync', 
			type: {
				name: 'SStruct',
				data: {
					fields: [
						{ code: 'sourceProjectId', name: 'Source project ID', type: 'SString', readonly: true },
						{ code: 'isLocked', name: 'Locked', type: 'SBool' },
						{ code: 'reason', name: 'Reason', type: 'SString' },
					]
				}
			},
		},
		{ code: 'releaseProjectId', name: 'Game project ID', type: 'SString' },
		{ code: 'build', name: 'Build', type: {
				name: 'SLink',
				data: {
					project: 'solcery',
					templateCode: 'unityBuilds',
				}
			}
		}
	],
};

export default function ProjectConfig() {
	const [doc, setDoc] = useState(undefined);
	const { sageApi } = useProject();

	const reloadDoc = useCallback(() => {
		sageApi.project.getConfig().then(res => setDoc(new Document(schema, res.fields)));
	}, [ sageApi.project ]);

	useEffect(() => {
		reloadDoc();
	}, [ reloadDoc ]);

	const onSave = (fields) => {
		return sageApi.project.setConfig({ fields }).then(res => {
			if (res.modifiedCount) {
				notify({ message: 'Project config updated', type: 'success' });
				reloadDoc();
			}
		});
	};

	if (!doc) return <></>;
	return <DocumentEditor doc={doc} onSave={onSave} />;
}
