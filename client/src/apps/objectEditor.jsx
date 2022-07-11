import { Table, Button } from 'antd';
import React, { useState, useEffect, useContext } from 'react';
import { useObject } from '../contexts/object';
import { useTemplate } from '../contexts/template';
import { notify } from '../components/notification';
import './objectEditor.css'

const { Column } = Table;

export default function ObjectEditor(props) {
	const { object, setField, saveObject, fieldStatus } = useObject();
	const { template } = useTemplate();

	const save = () => { // TODO: move to object context
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
				let fieldName = template.fields[reason.fieldCode].name;
				notify({
					message: `Error`,
					description: `Invalid value for field '${fieldName}'` ,
					color: '#FFDDDD',
				});
			} 
		}
		saveObject().then(onSaveSuccess, onSaveFail)
	}

	if (!template || !object || !fieldStatus) return <>Loading</>;

	let fields = object.fields;
	let tableData = Object.values(template.fields).map(field => {
		return {
			key: field.code,
			field: field,
			value: fields[field.code],
			status: fieldStatus[field.code]
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
							onChange={!record.field.readonly ? (value) => {
								setField(value, [ record.field.code ]);
							} : undefined}
							type={record.field.type}
							path={{
								moduleName: props.moduleName,
								templateCode: props.schema.code,
								objectId: props.object._id,
								fieldPath: [ record.field.code ],
							}}
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

