import { SType } from '../base'
import { ValueRender } from './components'

class SEnum {
	static fromString = data => new SEnum({ values: data.split('|') });
	constructor(data) {
		this.values = data.values;
		this.constructValues = data.constructValues;
	}
	construct = (value, meta) => {
		let i = value ?? 0;
		return this.constructValues ? this.constructValues[i] : i; 
	}
	valueRender = ValueRender;
	default = 0;
};

SType.register('SEnum', SEnum);
export { SEnum }
