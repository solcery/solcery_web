import { Table, Button } from 'antd';
import React, { useState } from 'react';
import { useHotkey } from '../contexts/hotkey';
import { notify } from '../components/notification';
import './documentEditor.css'

const { Column } = Table;

export default function DocumentEditor(props) {
	const [ revision, setRevision ] = useState(1);

	const save = useHotkey({ key: 'ctrl+s', noDefault: true }, () => { // TODO: move to object context
		let res = props.doc.getChanges();
		if (res) {
			props.onSave(res)
		} else {
			notify({
				message: `Not saved`,
				description: 'Cannot save data, no changes in fields',
				color: '#FFFFDD',
			});
		}
	}, { preventDefault: true })

	const editDoc = (value, path) => {
		props.doc.setField(value, path)
		setRevision(revision + 1)
	}

	useHotkey('escape', () => {
		let changed = false;
		for (let status of Object.values(props.doc.fieldStatus)) {
			if (status === 'changed') {
				changed = true;
				break;
			}
		}
		if (changed && !window.confirm('You have unsaved changed. Still leave?')) return;
		props.onExit && props.onExit();
	})

	if (!props.doc) return <>Loading</>;
	let tableData = Object.values(props.doc.schema).map(field => {
		return {
			key: field.code,
			field: field,
			value: props.doc.fields[field.code],
			status: props.doc.fieldStatus[field.code],
			onChange: !field.readonly ? (value) => editDoc(value, [ field.code ]) : undefined,
		};
	});
	return (<>
		<Button style={{ width: '100%' }} onClick={save}>
			SAVE
		</Button>
		<Table pagination={false} dataSource={tableData}>
			<Column 
				title="Field" 
				key="Field" 
				dataIndex="fieldName" 
				render={(text, record) => 
					<p className={record.status}>{record.field.name}</p>} 
				/>
			<Column
				title="Value"
				key="value"
				dataIndex="value"
				render={(text, record) => (
					<record.field.type.valueRender
						defaultValue={record.value}
						onChange={record.onChange}
						type={record.field.type}
						path={{
							moduleName: props.moduleName,
							templateCode: props.doc.schema,
							objectId: 'documentId',
							fieldPath: [ record.field.code ],
						}}
					/>
				)}
			/>
		</Table>
		<Button style={{ width: '100%' }} onClick={save}>
			SAVE
		</Button>
	</>);
}

