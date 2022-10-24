import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Pagination } from 'antd';
import { Template } from '../../content/template';
import { useProject } from '../../contexts/project';
import { useContent } from '../../contexts/content';
import { useHotkey } from '../../contexts/hotkey';
import { useUser } from '../../contexts/user';
import { useCookies } from 'react-cookie';
import { FilterOutlined } from '@ant-design/icons';
import { HeaderCell } from './components/header';
import { ActionsBar } from './components/actionsBar';
import Document from './../../content/document';
import StorageViewerBase from './base';
import StorageViewerEdit from './edit';

const { Column } = Table;

export default function StorageViewer({ templateCode, moduleName }) {
	const { content, updateContent } = useContent();
	const { doubleClickToOpenObject } = useUser();
	const [ editModeDocs, setEditModeDocs ] = useState();
	const [objects, setObjects] = useState();
	const [template, setTemplate] = useState();

	useEffect(() => {
		if (!content) return;
		setObjects(content.objects.filter(obj => obj.template === templateCode));
		setTemplate(new Template(content.templates.find(tpl => tpl.code === templateCode)));
	}, [ content ]);

	if (!template || !objects) return <>NO DATA</>;

	let fields = Object.values(template.fields).filter(field => !field.hidden);

	const enterEditMode = (objects) => {
		let documents = objects.map(obj => new Document(template, obj.fields, obj.id))
		setEditModeDocs(documents)
	}

	const exitEditMode = () => {
		setEditModeDocs(undefined);
	}

	return <>
		{editModeDocs && <StorageViewerEdit 
			fields={fields}
			template={template}
			docs={editModeDocs}
			onExitEditMode={exitEditMode}
		/>}
		{!editModeDocs && <StorageViewerBase
			fields={fields}
			objects={objects}
			template={template}
			onEnableEditMode={enterEditMode}
		/>}
	</>;
}
