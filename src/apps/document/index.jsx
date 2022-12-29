import { Table, Button } from 'antd';
import React, { useState, useEffect } from 'react';
import { useHotkey } from '../../contexts/hotkey';
import { notif } from '../../components/notification';
import { useLocation, useParams } from 'react-router-dom';
import { FieldRender } from 'content/types'
import './style.css';

const { Column } = Table;

export default function DocumentEditor(props) {
	const [revision, setRevision] = useState(1);
	const [ changed, setChanged ] = useState(false);
	const location = useLocation();
	const { templateCode, objectId, fieldPath } = useParams();

	const exit = useHotkey('Escape', () => {
		if (changed && !window.confirm('You have unsaved changed. Still leave?')) return;
		props.onExit && props.onExit();
	});

	useEffect(() => {
		updateChangedStatus();
	}, [ props.doc ])

	const save = useHotkey(
		{ key: 'Ctrl+KeyS', noDefault: true },
		() => {
			// TODO: move to object context
			let res = props.doc.getChanges();
			if (res) {
				for (let [ key ,value ] of Object.entries(res)) {
					if (value === undefined) {
						res[key] = null;
					}
				}
				props.onSave(res);
			} else {
				notif.info('Not saved', 'No changes, exiting');
				exit();
			}
		},
		{ preventDefault: true }
	);

	const updateChangedStatus = () => {
		let currentStatus = false
		for (let status of Object.values(props.doc.fieldStatus)) {
			if (status === 'changed') {
				currentStatus = true;
				break;
			}
		}
		if (currentStatus !== changed) {
			setChanged(currentStatus);
		}
	}

	const editDoc = (value, path) => {
		props.doc.setField(value, path);
		for (let status of Object.values(props.doc.fieldStatus)) {
			if (status === 'changed') {
				setChanged(true);
				break;
			}
		}
		updateChangedStatus();
		setRevision(revision + 1);
	};

	if (!props.doc) return <>Loading</>;
	let tableData = Object.values(props.doc.schema).map(field => ({
		key: field.code,
		field: field,
		value: props.doc.fields[field.code],
		status: props.doc.fieldStatus[field.code],
		onChange: !field.readonly ? (value) => editDoc(value, [field.code]) : undefined,
	}));

	return (
		<>
			<Button style={{ width: '100%' }} onClick={changed ? save : exit}>
				{changed ? 'SAVE' : 'EXIT'}
			</Button>
			<Table pagination={false} dataSource={tableData}>
				<Column
					title="Field"
					key="Field"
					dataIndex="fieldName"
					render={(text, record) => <p className={record.status}>{record.field.name}</p>}
				/>
				<Column
					title="Value"
					key="value"
					dataIndex="value"
					render={(text, record) => <div>
						<FieldRender
							defaultValue={record.value}
							onChange={record.onChange}
							type={record.field.type}
							path={[record.field.code]}
						/>
					</div>}
				/>
			</Table>
			<Button style={{ width: '100%' }} onClick={changed ? save : exit}>
				{changed ? 'SAVE' : 'EXIT'}
			</Button>
		</>
	);
}
