import { BrickLibrary } from './brickLib';
import { Template } from '../content/template';

export * from './types';
export * from './template';
export * from './brickLib';

export const execute = async (func, extra) => {
	let meta = Object.assign(
		{
			errors: [],
		},
		extra
	);
	let content = meta.content;
	content.templates = content.templates.map((tpl) => new Template(tpl));
	for (let template of content.templates) {
		meta.template = template;
		let objects = content.objects.filter((obj) => obj.template === template.code);
		for (let object of objects) {
			meta.object = object;
			func(object, meta);
		}
	}
	return meta;
};

export const validate = ({ content }) => {
	let meta = {
		errors: [],
		status: true,
		brickLibrary: new BrickLibrary(content).bricks,
		content,
	};
	let templates = content.templates.map((template) => new Template(template));
	for (let template of templates) {
		let fields = Object.values(template.fields).filter((field) => field.type.validate);
		let objects = content.objects.filter((obj) => obj.template === template.code);
		for (let object of objects) {
			meta.object = object;
			for (let field of fields) {
				meta.error = function (message) {
					this.errors.push({
						template: template.code,
						object: object._id,
						field: field.code,
						message: message,
					});
					this.status = false;
				};
				field.type.validate(object.fields[field.code], meta);
			}
		}
	}
	return {
		status: meta.status,
		errors: meta.errors,
	};
};

export const build = ({ targets, content }) => {
	let validationResult = validate({ content });
	if (!validationResult.status) {
		return validationResult;
	}
	let result = Object.fromEntries(targets.map((target) => [target, {}]));
	let meta = {
		intIds: {},
		objectCodes: {},
		brickLibrary: new BrickLibrary(content).bricks,

		addIntId: function (objectId) {
			let intId = Object.keys(this.intIds).length + 1;
			this.intIds[objectId] = intId;
			return intId;
		},
		getIntId: function (objectId) {
			return this.intIds[objectId];
		},

		addObjectCode: function (objectId, code) {
			this.objectCodes[code] = objectId;
		},

		getObjectCode: function (code) {
			return this.objectCodes[code];
		},
	};
	let templates = content.templates.map((template) => new Template(template));
	let tpl = templates.map((template) => {
		let objects = content.objects.filter((obj) => obj.template === template.code);
		for (let obj of objects) {
			meta.addIntId(obj._id);
			if (obj.fields.code) {
				meta.addObjectCode(obj._id, obj.fields.code);
			}
		}
		return [template.code, { template, objects }];
	});
	meta.rawContent = Object.fromEntries(tpl);

	meta.stringMacros = meta.rawContent.stringReplaceRules.objects
		.filter((object) => object.fields.source && object.fields.result)
		.map((object) => {
			return {
				source: object.fields.source,
				result: object.fields.result,
			};
		});

	//Building target
	for (let target of targets) {
		let constructed = {};
		meta.target = target;
		for (let template of templates) {
			if (template.buildTargets) {
				let buildCode = template.buildTargets[target];
				if (buildCode) {
					constructed[buildCode] = meta.rawContent[template.code].objects
						.filter((obj) => obj.fields.enabled)
						.map((obj) => {
							meta.object = obj;
							return template.build(obj, meta);
						});
				}
			}
		}
		if (target.includes('unity')) {
			Object.entries(constructed).forEach(([name, objects]) => {
				result[target][name] = { name, objects };
			});
		}
		if (target === 'web') {
			for (let [code, objects] of Object.entries(constructed)) {
				result[target][code] = Object.fromEntries(objects.map((obj) => [obj.id, obj]));
			}
		}
	}
	return {
		status: true,
		constructed: result,
	};
};
