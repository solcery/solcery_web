import { SType } from './types'

export class Template {
	constructor(data) {
		this.name = data.name;
		this.code = data.code;
		this.fields = {}
		for (let field of data.fields) {
			this.fields[field.code] = {
				code: field.code,
				name: field.name,
				type: SType.from(field.type),
			}
		}
	}

	construct = (object, meta) => {
		let result = {}
		let objectId = object._id;
		let intId = meta.linkToIds[objectId]
		if (!intId) {
			intId = Object.keys(meta.linkToIds).length + 1
			meta.linkToIds[objectId] = intId
		}
		result.id = intId
		for (let field of Object.values(this.fields)) {
			if (object.fields[field.code]) {
				result[field.code] = field.type.construct(object.fields[field.code], meta)
			}
		}
		console.log(result)
		return result
	}
}
