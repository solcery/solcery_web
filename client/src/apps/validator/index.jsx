import { useState, useEffect } from 'react';
import { Button, Select, Card, Table } from 'antd';
import { useUser } from '../../contexts/user';
import { DownloadJSON } from '../../components/DownloadJSON';
import { useProject } from '../../contexts/project';
import { build, validate } from '../../content';
import { Link } from 'react-router-dom';
import { Session } from '../../game';
import { DownloadOutlined } from '@ant-design/icons';
const { Option } = Select;

export default function Validator() {
	const [ result, setResult ] = useState()
	const { sageApi } = useProject();

	useEffect(() => {
		validateContent();
	}, [])

	const validateContent = async () => {
		let content = await sageApi.project.getContent({ objects: true, templates: true });
		let res = await validate({ content });
		setResult(res)
	};

	let statusCaption = 'Validation in progress...';
	let errors;
	if (result) {
		statusCaption = result.status ? 'Validation successfull!' : 'Validation unsuccessful. Errors below';

		errors = result.errors?.map((error, index) => ({
			key: `error_${index}`,
			template: error.template,
			object: error.object,
			field: error.field,
			message: error.message,
			link: `../template/${error.template}/${error.object}`,
		}));
	}

	const columns = [
		{
			title: 'Template',
			dataIndex: 'template',
			key: 'template',
		},
		{
			title: 'Object',
			dataIndex: 'object',
			key: 'object',
		},
		{
			title: 'Field',
			dataIndex: 'field',
			key: 'field',
		},
		{
			title: 'Message',
			dataIndex: 'message',
			key: 'Message',
			render: (text, record) => <Link state={{ scrollToField: record.field }} to={record.link}>{text}</Link>
		},
	];


	return (<>
		<Card title="Status">
			<p>{statusCaption}</p>
		</Card>
		{result?.status === false && <Card title="Errors">
			<Table 
				pagination={false} 
				dataSource={errors} 
				columns={columns} 
			/>
		</Card>}
	</>);
}
