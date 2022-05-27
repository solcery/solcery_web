import { SageAPI } from '../api';
import { Template } from '../content/template';

export const build = async ({ targets, brickLibrary }) => { //TODO: remove brickLibrary?
	let result = Object.fromEntries(targets.map(target => [ target, {} ]));
	let meta = {
		intIds: {},
		brickLibrary,
		addIntId: function(objectId) {
			let intId = Object.keys(this.intIds).length + 1;
			this.intIds[objectId] = intId;
			return intId
		},
		getIntId: function(objectId) {
			return this.intIds[objectId];
		}
		
	}

	let templates = (await SageAPI.project.getAllTemplates()).map(template => new Template(template))
	let tpl = templates.map(async (template) => {
		let objects = await SageAPI.template.getAllObjects(template.code);
		for (let obj of objects) {
			meta.addIntId(obj._id);
		}
		return [ template.code, objects ];
	});
	let rawContent = Object.fromEntries(await Promise.all(tpl));

	meta.stringMacros = (rawContent.stringReplaceRules)
		.filter(object => object.fields.source && object.fields.result)
		.map(object => {
			return {
				source: object.fields.source,
				result: object.fields.result,
			}
		})

	//Building target
	for (let target of targets) {
		let constructed = {};
		meta.target = target;
		for (let template of templates) {
			if (template.constructTargets.includes(target)) {
				constructed[template.code] = rawContent[template.code].map(obj => template.construct(obj, meta))
			}
		}
		console.log(constructed)
		if (target === 'unity') {
			Object.entries(constructed).forEach(([ name, objects ]) => {
				result.unity[name] = { name, objects }
			});
		}
		if (target === 'web') {
			for (let [ code, objects ] of Object.entries(constructed)) {
				result.web[code] = Object.fromEntries(objects.map(obj => [ obj.id, obj ]))
			}
		}
	}
	return result;
}