import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { useProject } from '../contexts/project';

const { Column } = Table;

export default function ApiLogs() {
	const { sageApi } = useProject();

	const [logs, setLogs] = useState();

	useEffect(() => {
		sageApi.project.getLogs().then(setLogs);
	}, [sageApi.project]);

	useEffect(() => {
		console.log(logs);
	}, [logs]);

	if (!logs) return <></>;
	let tableData = logs.map((entry) => ({
		_id: entry._id,
		key: entry._id,
		success: JSON.stringify(entry.response.status),
		userId: entry.userId,
		params: JSON.stringify(entry.params, undefined, 2),
		command: entry.command,
		response: JSON.stringify(entry.response, undefined, 2),
		module: entry.module,
	}));

	return (
		<>
			<Table dataSource={tableData}>
				<Column title="Command" dataIndex="command" />
				<Column title="Module" dataIndex="module" />
				<Column title="User" dataIndex="userId" />
				<Column title="Params" dataIndex="params" />
				<Column title="Response" dataIndex="response" />
			</Table>
		</>
	);
}
