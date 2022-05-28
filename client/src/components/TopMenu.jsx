import { Menu, Avatar } from "antd";
import React, { useEffect, useState } from "react";
import { SageAPI } from '../api';
import { UserOutlined, CaretRightOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

export const TopMenu = () => {
	const [ templates, setTemplates ] = useState([]);

	useEffect(() => {
		SageAPI.project.getAllTemplates().then(setTemplates)
	}, []);

	return (<>
		<Menu mode="horizontal">
			<Menu.Item key='project'>
				<a href='project'><Avatar size={'small'} icon=<DeploymentUnitOutlined/>/></a>
			</Menu.Item>
			<Menu.Item key='play'>
				<a href='play'><Avatar size={'small'} icon=<CaretRightOutlined/>/></a>
			</Menu.Item>
			{templates.filter(template => !template.hidden).map(template =>
				<Menu.Item key={template.code}>
						<a href={`template.${template.code}`}>{template.name}</a>
				</Menu.Item>
			)}
			<Menu.Item key='profile'>
				<a href='profile'>
					<Avatar size={'small'} icon=<UserOutlined/>/>
				</a>
			</Menu.Item>
		</Menu>
	</>);
};
