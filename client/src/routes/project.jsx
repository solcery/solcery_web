import Reac from 'react'
import { Button } from 'antd';
import { Template } from '../content/template';
import { SageAPI } from '../api';
import { useBrickLibrary } from '../contexts/brickLibrary';

export default function Project() {

	const { brickLibrary } = useBrickLibrary();

	const constructContent = async () => {
		let result = {};
		let meta = { 
			target: 'web',
			linkToIds: {},
			brickLibrary,
		}
		let templates = await SageAPI.project.getAllTemplates()
		let res = templates.map(async (templateData) => {
			let tpl = new Template(templateData)
			let objectDatas = await SageAPI.template.getAllObjects(tpl.code);
			return [ templateData.code, objectDatas.map(obj => tpl.construct(obj, meta)) ]
		})
		let constructedTemplates = await Promise.all(res)
		if (meta.target === 'unity') {
			constructedTemplates.forEach(([ code, data ]) => {
				result[code] = {
					name: code,
					objects: data
				}
			});
		}
		if (meta.target === 'web') {
			result = Object.fromEntries(constructedTemplates);
		}
		console.log(JSON.stringify(result, undefined, 2));
	}

	return (
		<Button onClick={constructContent}>
			Construct
		</Button>
	);
}
