import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button } from 'antd';
import { Template } from '../content/template'
import { SageAPI } from '../api'

const { Column } = Table;

export default function CollectionEditor() {

	let navigate = useNavigate();
	let { templateCode } = useParams();
	const [ objects, setObjects ] = useState(undefined);
	const [ template, setTemplate ] = useState(undefined)
	
	useEffect(() => {
		SageAPI.template.getAllObjects(templateCode).then(setObjects);
		SageAPI.template.getSchema(templateCode).then((data) => setTemplate(new Template(data)));
	}, [ templateCode ]);

	if (!template || !objects) return (<>NO DATA</>);

	let tableData = []
	for (let object of objects) {
		let objectData = {
			id: object._id,
			key: object._id,
			fields: {},
		}
		for (let field of Object.values(template.fields)) {
			objectData.fields[field.code] = object.fields[field.code]
		}
		tableData.push(objectData)
	}
	return (
		<>
			<Table 
				dataSource={tableData}
				onRow={(record, rowIndex) => {
					return {
						onDoubleClick: event => { 
							navigate(`/template.${template.code}.${record.id}`) 
						}
					};
				}}
			>
				{Object.values(template.fields).map(field => 
					<Column 
						title={field.name} 
						key={field.code} 
						dataIndex={field.code}
						render = {(_, object) => <field.type.valueRender
							defaultValue = { object.fields[field.code] }
							type = { field.type }
						/>}
					/>)}
				<Column 
					title="Actions"
					key="actions"
					render={(_, object) =>
					<div key={ 'actions.' + object.id }>
						<Button 
							key={ 'copy.' + object.id } 
							onClick={() => { 
								SageAPI.template.clone(templateCode, object.id).then((res) => {
									if (res.insertedId) {
										navigate(`/template.${template.code}.${res.insertedId}`);
									}
								});
							}}>
							Copy
						</Button>	
						<Button 
							key={ 'delete.' + object.id } 
							onClick={() => { 
								if (window.confirm('Deleting object [' + object.id + '] ' + object.fields.title + '. Are you sure?')) {
									SageAPI.template.removeById(templateCode, object.id).then((res) => {
										if (res.deletedCount) {
											navigate(`/template.${template.code}`) 
										}
									});
								} 
							}}>
							Delete
						</Button>
					</div>} 
				/>
			</Table>
			<Button 
				onClick={() => { 
					SageAPI.template.create(templateCode).then((res) => {
						if (res.insertedId) {
							navigate(`/template.${template.code}.${res.insertedId}`);
						}
					});
				}}>
				Create
			</Button>
		</>
	);
}