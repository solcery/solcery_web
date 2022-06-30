import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SLink extends SType {
	static fromString = (data) => new SLink({ templateCode: data });

	constructor(data = {}) {
		super();
		this.templateCode = data.templateCode;
		this.field = data.field;
	}

	validate = (value, meta) => {
		if (value === undefined) return;
		let obj = meta.content.objects.find(obj => obj._id === value);
		if (!obj) {
			meta.error(`Broken link [${value}]!`);
			return;
		}
	};

	build = (value, meta) => {
		if (this.field) {
			let tpl = meta.rawContent[this.templateCode];
			let obj = tpl.objects.find((obj) => obj._id === value);
			if (!obj) throw new Error('Error constructing link, no object!');
			return tpl.template.fields[this.field].type.construct(obj.fields[this.field], meta); //TODO
		}
		return meta.getIntId(value);
	};

	valueRender = ValueRender;
	default = () => undefined;
}

SType.register('SLink', SLink);
export { SLink };
