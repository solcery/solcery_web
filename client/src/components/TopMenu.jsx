import { Menu, Avatar } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useProject } from '../contexts/project';
import { useUser } from '../contexts/user';
import { UserOutlined, CaretRightOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

export const TopMenu = () => {
	const [templates, setTemplates] = useState([]);
	const { sageApi, projectName } = useProject();
	const { nick } = useUser();

	useEffect(() => {
		sageApi.project.getContent({ templates: true }).then((res) => setTemplates(res.templates));
	}, [sageApi.project]);

	return (
		<>
			<Menu mode="horizontal" >
				<Menu.SubMenu style={{ fontWeight: 'bold' }} title={projectName} key="project" icon=<DeploymentUnitOutlined />>
					<Menu.Item key='builder' >
						<Link to="builder">
							Builder
						</Link>
					</Menu.Item>
					<Menu.Item key='export' >
						<Link to="export">
							Export content
						</Link>
					</Menu.Item>
					<Menu.Item key='import' >
						<Link to="import">
							Import content
						</Link>
					</Menu.Item>
					<Menu.Item key='migrator' >
						<Link to="migrator">
							Migrations
						</Link>
					</Menu.Item>
					<Menu.Item key='apiLogs' >
						<Link to="apiLogs">
							API logs
						</Link>
					</Menu.Item>
				</Menu.SubMenu>
				<Menu.Item key="play" icon=<CaretRightOutlined />>
					<Link to="play" style={{ fontWeight: 'bold' }}>
						Play
					</Link>
				</Menu.Item>
				<Menu.Item key="brickLibrary">
					<Link to="brickLibrary">Brick library</Link>
				</Menu.Item>
				{templates
					.filter((template) => !template.hidden)
					.map((template) => (
						<Menu.Item key={template.code}>
							<Link to={`template.${template.code}`}>{template.name}</Link>
						</Menu.Item>
					))}
				<Menu.Item key="profile" icon=<UserOutlined /> >
					<Link to="profile" style={{ fontWeight: 'bold' }}>
						{nick}
					</Link>
				</Menu.Item>
			</Menu>
			<Outlet />
		</>
	);
};
