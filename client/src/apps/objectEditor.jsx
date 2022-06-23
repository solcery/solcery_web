import { Table, Button } from 'antd';

const { Column } = Table;

export default function ObjectEditor({ schema, object, onSave, instant }) {
	const setField = (fieldCode, value) => {
		object.fields[fieldCode] = value;
	};

	const save = () => onSave(object.fields);

	if (!schema || !object) return <>NO DATA</>; // TODO
	let tableData = Object.values(schema.fields).map((field) => {
		return {
			key: field.code,
			field: field,
			value: object.fields[field.code],
		};
	});
	return (
		<>
			<Button style={{ width: '100%' }} onClick={save}>
				SAVE
			</Button>
			<Table pagination={false} dataSource={tableData}>
				<Column title="Field" key="Field" dataIndex="fieldName" render={(text, record) => <p>{record.field.name}</p>} />
				<Column
					title="Value"
					key="value"
					dataIndex="value"
					render={(text, record) => (
						<record.field.type.valueRender
							instant={record.field.code === instant}
							defaultValue={record.value}
							onChange={(value) => {
								setField(record.field.code, value);
							}}
							type={record.field.type}
							object={object} 
							objectId={object._id}
							templateCode={schema.code}
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
