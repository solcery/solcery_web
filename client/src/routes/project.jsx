import Reac from 'react'
import { Button } from 'antd';
import { Template } from '../content/template';
import { SageAPI } from '../api';

export default function Project() {

	const constructContent = async () => {
		let meta = { linkToIds: {} }
		let templates = await SageAPI.project.getAllTemplates()
		let res = templates.map(async (templateData) => {
			let tpl = new Template(templateData)
			let objectDatas = await SageAPI.template.getAllObjects(tpl.code);
			return [ templateData.code, objectDatas.map(obj => tpl.construct(obj, meta)) ]
		})
		let result = await Promise.all(res).then(Object.fromEntries)
		console.log(result)
	}

	return (
		<Button onClick={constructContent}>
			Construct
		</Button>
	);
}
