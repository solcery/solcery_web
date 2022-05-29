import { SType } from '../base';
import { ValueRender } from './components';
import { DefaultFilterRender } from '../base/components';

class SString {
	static fromString = () => new SString({});
	
	constructor(data) {
		this.useMacros = data.useMacros;
	}
	
	construct = (value, meta) => {
		if (!this.useMacros) return value;
		let result = value;
		for (let { src, res } of meta.stringMacros) {
			result = result.replaceAll(src, res);
		}
		return result;
	};
	valueRender = ValueRender;
	filter = {
		eq: (value, filterValue) => value.toLowerCase().includes(filterValue.toLowerCase()),
		render: DefaultFilterRender,
	};
	default = () => '';
};

SType.register('SString', SString);
export { SString }
