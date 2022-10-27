import { useEffect, useState, useCallback } from 'react';
import { useProject } from '../../contexts/project'
import DocumentEditor from '../document';
import Document from '../../content/document';
import { notif } from '../../components/notification';

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
						{ code: 'sourceProjectId', name: 'Source project ID', type: 'SString'},
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
	const { engine } = useProject();

	const reloadDoc = useCallback(() => {
		engine.getConfig().then(res => {
			setDoc(new Document(schema, res))
		});
	}, [ engine ]);

	useEffect(() => {
		reloadDoc();
	}, [ reloadDoc ]);

	const onSave = (fields) => {
		return engine.setConfig(fields).then(res => {
			notif.success('Project config updated');
			reloadDoc();
		});
	};

	if (!doc) return <></>;
	return <DocumentEditor doc={doc} onSave={onSave} />;
}
