import { SType } from '../base'
import { ValueRender } from './components'

class SEnum {
	static fromString = data => new SEnum({ values: data.split('') });
	constructor(data) {
		this.values = data.values;
	}
	construct = (value, meta) => value;
	valueRender = ValueRender;
	default = 0;
};

SType.register('SEnum', SEnum);
export { SEnum }
