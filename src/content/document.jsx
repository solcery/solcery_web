import { insertTable } from '../utils';
import { Template } from './template';

export default class Document {
	constructor(schema, fields, id) {
		let tpl = schema instanceof Template ? schema : new Template(schema);
		this.id = id;
		this.schema = tpl.fields;
		this.fields = {};
		this.fieldStatus = {};
		this.initialFields = {};
		if (!fields) {
			fields = {};
			for (let field of Object.values(this.schema)) {
				fields[field.code] = field.type.default();
			}
		}
		for (let field of Object.values(this.schema)) {
			this.initialFields[field.code] = fields[field.code];
			this.fields[field.code] = field.type.clone(fields[field.code]);
			this.fieldStatus[field.code] = 'old';
		}
	}

	setField(value, fieldPath) {
		let fieldCode = fieldPath[0];
		let field = this.schema[fieldCode];
		insertTable(this.fields, value, ...fieldPath);
		if (field.type.eq(this.initialFields[fieldCode], this.fields[fieldCode])) {
			this.fieldStatus[fieldCode] = 'old';
		} else {
			this.fieldStatus[fieldCode] = 'changed';
		}
	}

	getChanges() {
		let payload = {};
		let changed = false;
		for (let [fieldCode, value] of Object.entries(this.fields)) {
			if (this.fieldStatus[fieldCode] === 'changed') {
				changed = true;
				payload[fieldCode] = value;
			}
		}
		return changed ? payload : undefined;
	}
}
