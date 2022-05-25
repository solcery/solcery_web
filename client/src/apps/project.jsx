import { Button } from 'antd';
import { Template } from '../content/template';
import { SageAPI } from '../api';
import { useBrickLibrary } from '../contexts/brickLibrary';

export default function Project() {

	const { brickLibrary } = useBrickLibrary();

	const constructContent = async () => {
		let target = 'web';
		let result = {};
		let meta = { 
			target,
			linkToIds: {},
			brickLibrary,
		}
		let templates = await SageAPI.project.getAllTemplates()

		meta.stringMacros = (await SageAPI.template.getAllObjects('stringReplaceRules'))
			.filter(object => object.fields.source && object.fields.result)
			.map(object => {
				return {
					source: object.fields.source,
					result: object.fields.result,
				}
			})

		let res = templates
			.filter(template => template.constructTargets.includes(target))
			.map(async (templateData) => {
				let tpl = new Template(templateData)
				let objectDatas = await SageAPI.template.getAllObjects(tpl.code);
				return [ templateData.code, objectDatas.map(obj => tpl.construct(obj, meta)) ]
			});
		let constructedTemplates = await Promise.all(res);
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
