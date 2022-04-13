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
}
