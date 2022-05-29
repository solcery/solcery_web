import { Menu, Avatar } from "antd";
import { Link } from "react-router-dom";
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
				<Link to='project'>
					<Avatar size={'small'} icon=<DeploymentUnitOutlined/>/>
				</Link>
			</Menu.Item>
			<Menu.Item key='play'>
				<Link to='play'>
					<Avatar size={'small'} icon=<CaretRightOutlined/>/>
				</Link>
			</Menu.Item>
			{templates.filter(template => !template.hidden).map(template =>
				<Menu.Item key={template.code}>
						<Link to={`template.${template.code}`}>{template.name}</Link>
				</Menu.Item>
			)}
			<Menu.Item key='profile'>
				<Link to='profile'>
					<Avatar size={'small'} icon=<UserOutlined/>/>
				</Link>
			</Menu.Item>
		</Menu>
	</>);
};
