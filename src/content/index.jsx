import { getTable } from 'utils';
import { BrickLibrary } from './brickLib/brickLibrary';
import { Template } from '../content/template';

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
			if (!object.fields.enabled) continue;
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

	// Preparing string object codes for macros
	for (let obj of content.objects) {
		meta.addIntId(obj._id);
		if (obj.fields.code) {
			meta.addObjectCode(obj._id, obj.fields.code);
		}
	}

	// Preparing custom string macros
	meta.stringMacros = content.objects
		.filter(object => object.template === 'stringReplaceRules')
		.filter(object => object.fields.source && object.fields.result)
		.map(object => ({
			source: object.fields.source,
			result: object.fields.result,
		}));

	meta.content = content;

	let revision = 0;
	for (let schema of content.templates) {
		revision = revision + schema.revision;
	}

	//Building target
	let constructed = {}
	try {
		for (let target of targets) {
			let result = {}
			meta.target = target;
			for (let schema of content.templates) {
				let template = new Template(schema);
				let res = template.build(content, meta);
				if (!res) continue;
				result[res.key] = res.value;
			}
			result.metadata = { revision };
			constructed[target.name] = result;
		}
	} catch (error) {
		console.error(meta.target.name)
		throw(error) // TODO:
	} finally {
		return {
			status: true,
			constructed,
		};
	}
};
