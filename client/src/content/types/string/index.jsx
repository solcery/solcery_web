import { SType } from '../base';
import { ValueRender } from './components';
import { DefaultFilterRender } from '../base/components';

class SString extends SType {
	static fromString = () => new SString({});

	constructor(data = {}) {
		super();
		this.useMacros = data.useMacros;
		this.isPrimaryTitle = data.isPrimaryTitle;
		this.width = data.width;
		this.textArea = data.textArea;
	}

	build = (value, meta) => {
		if (!this.useMacros) return value;

		// Applying macros
		function applyLinkMacro(match, template, code) {
			let templateObjects = meta.rawContent[template];
			if (!templateObjects) return match;
			let obj = templateObjects.objects.find((obj) => obj.fields.code === code);
			let intId = meta.getIntId(obj._id);
			return `<link="${intId}">`;
		}
		let res = value;
		for (let { source, result } of meta.stringMacros) {
			res = res.replaceAll(source, result);
		}
		res = res.replace(/<link=([a-zA-Z]+).([a-zA-Z0-9]+)>/g, applyLinkMacro);
		return res;
	};

	valueRender = ValueRender;
	default = () => '';

	filter = {
		eq: (value, filterValue) => {
			if (value === undefined) return false;
			if (filterValue === undefined) return true;
			return value.toLowerCase().includes(filterValue.toLowerCase());
		},
		render: DefaultFilterRender,
	};

	sort = (a, b) => (a ?? '').localeCompare(b ?? '');
}

SType.register('SString', SString);
export { SString };
