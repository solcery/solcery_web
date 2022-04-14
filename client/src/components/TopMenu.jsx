import { Menu } from "antd"
import React, { useEffect, useState } from "react"
import { SageAPI } from '../api'

export const TopMenu = () => {
	const [ templates, setTemplates ] = useState([]);

	useEffect(() => {
		SageAPI.project.getAllTemplates().then(setTemplates)
	}, []);

	return (
		<>
		<Menu mode="horizontal">
			{templates.map(template =>
			<Menu.Item key={template.code}>
					<a href={`template.${template.code}`}>{template.name}</a>
			</Menu.Item>
			)}
		</Menu>
		</>);
};
