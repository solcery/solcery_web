import { Table, Button } from 'antd';
import { useState, useEffect } from 'react';
import { notify } from '../components/notification';
import './objectEditor.css'

const { Column } = Table;

export default function ObjectEditor(props) {

	const [ fields, setFields ] = useState(undefined);
	const [ revision, setRevision ] = useState(1)

	useEffect(() => {
		if (!props.object || !props.schema) return;
		let res = {}
		for (let field of Object.values(props.schema.fields)) {
			let status = 'old';
			let value = field.type.clone(props.object.fields[field.code])
			let validator = field.type.validateField;
			if (validator && !validator(value)) status = 'error';
			res[field.code] = { value, status }
		}
		setFields(res)
	}, [ props.object, props.schema ])

	const setField = (fieldCode, value) => {
		let field = props.schema.fields[fieldCode]
		if (field.type.eq(value, props.object.fields[fieldCode])) {
			fields[fieldCode] = {
				value: undefined,
				status: 'old'
			}
			setRevision(revision + 1)
		} else {
			let oldStatus = fields[fieldCode].status
			let status = 'changed'
			let validator = props.schema.fields[fieldCode].type.validateField
			if (validator) {
				if (!validator(value)) status = 'error';
			}
			fields[fieldCode] = { value, status}
			if (oldStatus !== status) {
				setRevision(revision + 1);
			}
		}
	};

	const save = () => {
		let payload = {};
		for (let [ fieldCode, { value, status }] of Object.entries(fields)) {
			if (status === 'error') {
				let fieldName = props.schema.fields[fieldCode].name
				notify({
					message: `${fieldName}`,
					description: 'Cannot save object, validation not passed',
					color: '#FFDDDD',
				});
				return;
			}
			if (status === 'changed') {
				payload[fieldCode] = value;
			}
		}
		if (Object.keys(payload).length === 0) {
			notify({
				message: `Not saved`,
				description: 'Cannot save object, no changes in fields',
				color: '#FFFFDD',
			});
		}
		props.onSave(payload);
	}

	if (!fields || !props.schema) return <>NO DATA</>; // TODO
	let tableData = Object.values(props.schema.fields).map((field) => {
		return {
			key: field.code,
			field: field,
			value: fields[field.code].value,
			status: fields[field.code].status
		};
	});
	return (
		<>
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
							onChange={(value) => {
								setField(record.field.code, value);
							}}
							type={record.field.type}
							object={props.object} 
							objectId={props.object._id}
							templateCode={props.schema.code}
							fieldCode={record.key}
						/>
					)}
				/>
			</Table>
			<Button style={{ width: '100%' }} onClick={save}>
				SAVE
			</Button>
		</>
	);
}
