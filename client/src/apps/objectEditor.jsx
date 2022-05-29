import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Template } from '../content/template';
import { Table, Button } from "antd";
import { SageAPI } from '../api';
import { useCookies } from 'react-cookie';

const { Column } = Table;

export default function ObjectEditor({ templateCode, objectId, onSave }) {
	console.log(templateCode)
	let navigate = useNavigate();
	
	const [ object, setObject ] = useState(undefined);
	const [ template, setTemplate ] = useState(undefined);
	
	useEffect(() => {
		SageAPI.template.getObjectById(templateCode, objectId).then(setObject);
		SageAPI.template.getSchema(templateCode).then((data) => setTemplate(new Template(data)));
	}, [ objectId, templateCode ]);

	const save = () => {
		SageAPI.template.updateObjectById(templateCode, objectId, object.fields).then((res) => { 
			if (res.modifiedCount) {
				if (onSave) onSave(); 
			}
		});
	}

	if (!template || !object) return (<>NO DATA</>); // TODO
	let tableData = Object.values(template.fields).map(field => {
		return {
			key: field.code,
			field: field,
			value: object.fields[field.code]
		}
	})
	return (
		<>
			<Table pagination={false} dataSource={tableData}>
				<Column 
					title='Field' 
					key='Field' 
					dataIndex='fieldName' 
					render={ (text, record) => <p>{ record.field.name }</p> }
				/>
				<Column 
					title='Value' 
					key='value' 
					dataIndex='value' 
					render={(text, record) => <record.field.type.valueRender
						defaultValue = { record.value }
						onChange = {(value) => { object.fields[record.field.code] = value } }
						type = { record.field.type }
					/>}
				/>
			</Table>
			<Button onClick={save}>SAVE</Button>
		</>
	);
}