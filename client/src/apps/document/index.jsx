import { Table, Button } from 'antd';
import React, { useState } from 'react';
import { useHotkey } from '../../contexts/hotkey';
import { notify } from '../../components/notification';
import { useLocation } from 'react-router-dom';
import './style.css';

const { Column } = Table;

export default function DocumentEditor(props) {
	const [revision, setRevision] = useState(1);
	const [ changed, setChanged ] = useState(false);
	const location = useLocation();

	const exit = useHotkey('Escape', () => {
		if (changed && !window.confirm('You have unsaved changed. Still leave?')) return;
		props.onExit && props.onExit();
	});

	const save = useHotkey(
		{ key: 'Ctrl+KeyS', noDefault: true },
		() => {
			// TODO: move to object context
			let res = props.doc.getChanges();
			if (res) {
				props.onSave(res);
			} else {
				notify({
					message: `Not saved`,
					description: 'No changes, exiting',
					type: 'warning',
				});
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

	const onElementLoad = (path, element) => {
		let autoScroll = location.state?.scrollToField;
		if (autoScroll && path.fieldPath[0] === autoScroll) {
			let newLocationState = Object.assign({}, location.state);
			delete newLocationState.scrollToField;
			window.history.replaceState(newLocationState, document.title);
			element.scrollIntoView({ block: 'center' });
		}
	}

	if (!props.doc) return <>Loading</>;
	let tableData = Object.values(props.doc.schema).map(field => ({
		key: field.code,
		field: field,
		value: props.doc.fields[field.code],
		status: props.doc.fieldStatus[field.code],
		onChange: !field.readonly ? (value) => editDoc(value, [field.code]) : undefined,
		onElementLoad,
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
					render={(text, record) => (
						<record.field.type.valueRender
							onElementLoad={onElementLoad}
							defaultValue={record.value}
							onChange={record.onChange}
							type={record.field.type}
							path={{ //TODO: Doesn't work properly
								fieldPath: [record.field.code],
							}}
						/>
					)}
				/>
			</Table>
			<Button style={{ width: '100%' }} onClick={changed ? save : exit}>
				{changed ? 'SAVE' : 'EXIT'}
			</Button>
		</>
	);
}
