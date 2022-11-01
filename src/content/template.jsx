import { SType } from './types';

export class Template {
	constructor(data) {
		Object.assign(this, data);
		this.fields = {};
		for (let field of Object.values(data.fields)) {
			let newField = Object.assign({}, field);
			newField.type = SType.from(newField.type);
			this.fields[field.code] = newField;
		}
	}

	buildObject = (object, meta) => {
		meta.template = this;
		meta.object = object;
		let result = {
			id: meta.getIntId(object._id),
		};
		for (let field of Object.values(this.fields)) {
			if (field.buildTargets && field.buildTargets[meta.target.name]) {
				let buildCode = field.buildTargets[meta.target.name];
				if (object.fields[field.code] !== undefined) {
					result[buildCode] = field.type.construct(object.fields[field.code], meta);
				}
			}
		}
		return result;
		meta.object = undefined;
	};

	build = (content, meta) => {
		if (!this.buildTargets) return;
		let key = this.buildTargets[meta.target.name];
		if (!key) return;
		let objects;
		objects = content.objects
			.filter(object => object.template === this.code)
			.filter(object => (!this.singleton && object.fields.enabled) || object._id === this.singleton)
			.map(object => this.buildObject(object, meta));
		if (meta.target.format === 'unity') {
			if (this.singleton) {
				throw Error(`Error building template '${this.name}' - attempt to build singleton for Unity-related target`);
			}
			return {
				key,
				value: {
					name: key,
					objects,
				}
			}
		}
		if (meta.target.format === 'web') {
			let value;
			if (this.singleton) {
				value = objects[0];
			} else {
				value = Object.fromEntries(objects.map(object => [ object.id, object ]));
			}
			return {
				key,
				value,
			}
		}
		throw Error(`Error building template '${this.name}' - build target '${meta.target.name}' is not supported`);
	}

	validate = (object, meta) => {
		Object.values(this.fields)
			.filter((field) => field.type.validate)
			.forEach((field) => field.type.validate(object.fields[field.code], meta));
	};
}
