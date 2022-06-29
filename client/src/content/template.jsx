import { SType } from './types';

export class Template {
	constructor(data) {
		Object.assign(this, data);
		this.fields = {}
		for (let field of Object.values(data.fields)) {
			let newField = Object.assign({}, field);
			newField.type = SType.from(newField.type);
			this.fields[field.code] = newField;
		}
	}

	build = (object, meta) => {
		let result = {};
		result.id = meta.getIntId(object._id);
		for (let field of Object.values(this.fields)) {
			if (field.buildTargets && field.buildTargets[meta.target]) {
				let buildCode = field.buildTargets[meta.target];
				if (object.fields[field.code] !== undefined) {
					result[buildCode] = field.type.construct(object.fields[field.code], meta);
				}
			}
		}
		return result;
	};

	validate = (object, meta) => {
		Object.values(this.fields)
			.filter((field) => field.type.validate)
			.forEach((field) => field.type.validate(object.fields[field.code], meta));
	};
}
