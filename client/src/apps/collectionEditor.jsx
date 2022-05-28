import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import { Table, Button, Input } from 'antd';
import { Template } from '../content/template'
import { SageAPI } from '../api'
import { useCookies } from 'react-cookie';

const { Column } = Table;

export default function CollectionEditor() {

	let navigate = useNavigate();
	let { templateCode } = useParams();
	const filterCookieName = `filter.${templateCode}`;
	const [ objects, setObjects ] = useState(undefined);
	const [ template, setTemplate ] = useState(undefined)
	const [ cookies, setCookie ] = useCookies();

	useEffect(() => {
		SageAPI.template.getAllObjects(templateCode).then(setObjects);
		SageAPI.template.getSchema(templateCode).then((data) => setTemplate(new Template(data)));
	}, [ templateCode ]);

	const filterCookie = (fieldCode) => {
		return `filter.${templateCode}.${fieldCode}`;
	}

	if (!template || !objects) return (<>NO DATA</>);

	let tableData = objects.filter(object => {
		for (let field of Object.values(template.fields)) {
			let filterValue = cookies[filterCookie(field.code)]
			if (!filterValue) continue;
			let filter = field.type.filter;
			if (!filter) continue;
			if (!field.type.filter.eq(object.fields[field.code], filterValue)) return false;
		}
		return true;
	}).map(object => {
		return {
			id: object._id,
			key: object._id,
			fields: Object.assign({}, object.fields),
		}
	})
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
						title={field.name + (cookies[filterCookie(field.code)] ? `   [ ${cookies[filterCookie(field.code)]} ]` : '') } 
						key={field.code} 
						dataIndex={field.code}
						filterDropdown={field.type.filter && 
			              <field.type.filter.render 
			              	defaultValue={ cookies[filterCookie(field.code)] } 
			              	onChange={(value) => { setCookie(filterCookie(field.code), value) }}/>
			            }
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
