import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Pagination } from 'antd';
import { Template } from '../../content/template';
import { useProject } from '../../contexts/project';
import { useContent } from '../../contexts/content';
import { useHotkey } from '../../contexts/hotkey';
import { useUser } from '../../contexts/user';
import { notif } from '../../components/notification';
import { useCookies } from 'react-cookie';
import { FilterOutlined } from '@ant-design/icons';
import { HeaderCell } from './components/header';
import { ActionsBar } from './components/actionsBar';
import Document from './../../content/document';
import { SBrick } from './../../content/types/brick';

const { Column } = Table;

export default function StorageViewer({ template, docs, fields, onExitEditMode }) {
	const { engine } = useProject();
	const { updateContent } = useContent();
	const [objects, setObjects] = useState();
	const [ headerDocument, setHeaderDocument ] = useState();
	const [ revision, setRevision ] = useState(0);

	const onChangeDocumentField = (index, value, path) => docs[index].setField(value, path);
	var onHeaderFieldApplied = (fieldCode) => {
		let value = headerDocument.fields[fieldCode];
		for (let doc of docs) {
			doc.setField(value, [ fieldCode ]);
		}
		setRevision(revision + 1);
	}

	useEffect(() => {
		setHeaderDocument(new Document(template))
	}, [])
	
	const save = useHotkey(
		{ key: 'Ctrl+KeyS', noDefault: true },
		() => {
			let payload = [];
			for (let doc of docs) {
				let fields = doc.getChanges();
				if (fields) {
					payload.push({
						_id: doc.id,
						fields,
					})
				}
			}
			if (payload.length === 0) {
				return;
			}
			engine.template(template.code).updateObjects(payload).then(res => {
				notif.success('Changes applied');
				updateContent();
				onExitEditMode();
			})
		}
	);

	const exit = useHotkey('Escape', () => {
		onExitEditMode();
	});

	let columns = [];
	for (let field of fields) {
		if (field.type instanceof SBrick) continue;
		columns.push({
			key: `${template.code}.${field.code}`,
			title: <HeaderCell
				key={`${template.code}.${field.code}.header`}
				field={field}
				doc={headerDocument}
				onHeaderFieldApplied={onHeaderFieldApplied}
			/>,
			render: (_, object, index) => <field.type.valueRender
				key={revision}
				defaultValue={object.fields[field.code]}
				type={field.type}
				path={{
					moduleName: template.code,
					objectId: object._id,
					templateCode: template.code,
					fieldPath: [ field.code ],

				}}
				onChange={!field.readonly ? (value) => docs[index].setField(value, [ field.code ]) : undefined}
			/>	
		})
	}

	const tableData = docs.map(doc => ({
		id: doc.id,
		key: doc.id,
		fields: Object.assign({}, doc.fields),
	}))

	return (<>
		<Button onClick={onExitEditMode}>EXIT EDIT</Button>
		<Button onClick={save}>SAVE</Button>
		<Table
			key={`storage.${template.code}`}
			dataSource={tableData}
			pagination={false}
			columns={columns}
		/>
	</>);
}
