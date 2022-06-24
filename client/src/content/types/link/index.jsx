import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SLink {
	static fromString = (data) => new SLink({ templateCode: data });

	constructor(data) {
		this.templateCode = data.templateCode;
		this.field = data.field;
	}

	construct = (value, meta) => {
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
}

SType.register('SLink', SLink);
export { SLink };
