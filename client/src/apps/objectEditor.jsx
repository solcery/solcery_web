import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { Template } from '../content/template';
import { Table, Button } from "antd";
import { SageAPI } from '../api'

const { Column } = Table;

export default function TemplateObject() {

	let navigate = useNavigate();
	let { templateCode, objectId } = useParams();
	const [ object, setObject ] = useState(undefined);
	const [ template, setTemplate ] = useState(undefined);
	
	useEffect(() => {
		SageAPI.template.getObjectById(templateCode, objectId).then(setObject);
		SageAPI.template.getSchema(templateCode).then((data) => setTemplate(new Template(data)));
	}, [ objectId, templateCode ]);

	const save = () => {
		console.log('save')
		console.log(object.fields)
		SageAPI.template.updateObjectById(templateCode, objectId, object.fields).then((res) => { 
			console.log(res)
			if (res.modifiedCount) {
				navigate(`/template.${template.code}`) 
			}
		});
	}

	const construct = () => {
		if (template && object) {
			template.construct(object, { 
				linkToIds: {}
			})
		}
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
			<Table dataSource={tableData}>
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
			<Button onClick={construct}>CONSTRUCT</Button>
		</>
	);
}