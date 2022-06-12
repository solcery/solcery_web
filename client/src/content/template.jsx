import { SType } from './types';

export class Template {
	constructor(data) {
		this.name = data.name;
		this.code = data.code;
		this.buildTargets = data.buildTargets;
		this.fields = {};
		this.hidden = data.hidden;
		for (let field of data.fields) {
			this.fields[field.code] = {
				code: field.code,
				name: field.name,
				type: SType.from(field.type),
				buildTargets: field.buildTargets,
			};
		}
	}

	construct = (object, meta) => {
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
