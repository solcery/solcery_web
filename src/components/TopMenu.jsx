import { Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useProject } from '../contexts/project';
import { useUser } from '../contexts/user';
import { UserOutlined, CaretRightOutlined, DeploymentUnitOutlined } from '@ant-design/icons';

export const TopMenu = () => {
	const [templates, setTemplates] = useState([]);
	const { engine, projectConfig } = useProject();
	const [ projectName, setProjectName ] = useState();
	const user = useUser();

	useEffect(() => {
		engine.getContent({ templates: true }).then((res) => setTemplates(res.templates));
		engine.getConfig().then(res => setProjectName(res.projectName));

	}, [engine]);

	let tpls = templates
		.filter((template) => template.menuOrder)
		.sort((a, b) => a.menuOrder - b.menuOrder)
		.map(template => ({
			key: `template.${template.code}`,
			label: <Link to={`template/${template.code}`}>{template.name}</Link>,
		}))

	const items = [
		{
			key: 'project',
			icon: <DeploymentUnitOutlined />,
			label: <span style={{ fontWeight: 'bold' }}>{projectName}</span>,
			children: [
				{ 
					key: 'home',
					label: <Link to="">Home</Link>, 
				}, 
				{ 
					key: 'config',
					label: <Link to="config">Config</Link>, 
				},
				{ 
					key: 'validator',
					label: <Link to="validator">Validator</Link>, 
				}, 
				{
					key: 'utils',
					label: 'Utils',
					children: [
						{ 
							key: 'builder',
							label: <Link to="builder">Builder</Link>, 
						}, 
						{ 
							key: 'export',
							label: <Link to="export">Export</Link>, 
						}, 
						{ 
							key: 'import',
							label: <Link to="import">Import</Link>, 
						},
						{ 
							key: 'migrator', 
							label: <Link to="migrator">Migrator</Link>, 
						},
						{ 
							key: 'autotest' ,
							label: <Link to="autotest">Autotest</Link>, 
						},
					]
				},
			],
		},
		{
			key: 'play',
			icon: <CaretRightOutlined />,
			label: <Link to="play" style={{ fontWeight: 'bold' }}>Play</Link>,
		},
		...tpls,
	];

	if (user) items.push({
		key: 'profile',
		icon: <UserOutlined />,
		label: <Link to="profile" style={{ fontWeight: 'bold' }}>{user.nick}</Link>,
	})

	return (<>
		<Menu mode="horizontal" items={items}/>
		<Outlet />
	</>);
};
