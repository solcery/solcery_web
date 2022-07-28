import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SLink {
	static fromString = (data) => {
		let [ templateCode, field ] = data.split('|');
		return new SLink({ templateCode, field });
	}

	constructor(data) {
		this.templateCode = data.templateCode;
		this.field = data.field;
		this.project = data.project
		if (data.field && data.project) {
			throw new Error('Error reading SLink type: Cannot have both [project] and [field] properties!')
		}
	}

	validate = (value, meta) => {
		if (value === undefined) return;
		let obj = meta.content.objects.find(obj => obj._id === value);
		if (!obj) {
			meta.error(`Broken link [${value}]!`);
			return;
		}
	};

	construct = (value, meta) => {
		if (this.project) return value;
		if (this.field) {
			let tpl = meta.rawContent[this.templateCode];
			let obj = tpl.objects.find((obj) => obj._id === value);
			if (!obj) throw new Error('Error constructing link, no object!');
			return tpl.template.fields[this.field].type.construct(obj.fields[this.field], meta); //TODO
		}
		return meta.getIntId(value);
	};
	filter = defaultFilter;
	valueRender = ValueRender;
	default = () => undefined;
	eq = (a, b) => a === b;
	clone = (a) => a;
}

SType.register('SLink', SLink);
export { SLink };
