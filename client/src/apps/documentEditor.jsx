import { Table, Button } from 'antd';
import React, { useState, useEffect, useContext } from 'react';
import { useDocument } from '../contexts/document';
import { useHotkey } from '../contexts/hotkey';
import { notify } from '../components/notification';
import './documentEditor.css'

const { Column } = Table;

export default function DocumentEditor(props) {
	const [ revision, setRevision ] = useState(1);

	const save = useHotkey('ctrl+s', () => { // TODO: move to object context
		const onSaveSuccess = (res) => {
			props.onSave(res)
		}

		const onSaveFail = (reason) => {
			if (reason.error === 'emptySaveData') {
				notify({
					message: `Not saved`,
					description: 'Cannot save object, no changes in fields',
					color: '#FFFFDD',
				});
			}
			if (reason.error === 'invalidField') {
				let fieldName = props.schema.fields[reason.fieldCode].name;
				notify({
					message: `Error`,
					description: `Invalid value for field '${fieldName}'` ,
					color: '#FFDDDD',
				});
			} 
		}

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

	const exit = useHotkey('escape', () => {
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

