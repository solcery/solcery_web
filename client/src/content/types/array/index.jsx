import { SType } from '../base';
import { ValueRender } from './components';

class SArray extends SType {
	static fromString = (data) => new SArray({ valueType: data });
	constructor(data = {}) {
		super();
		this.valueType = SType.from(data.valueType);
	}
	build = (value, meta) => value.map(val => this.valueType.construct(val, meta));
	valueRender = ValueRender;
	default = () => [];
	eq = (a, b) => {
		if (!a !== !b) return false; //XOR
		if (a === b) return true;
		if (a.length != b.length) return false;
		for (let i in a) {
			if (!this.valueType.eq(a[i], b[i])) return false;
		}
		return true;
	}
	clone = (value) => value ? value.map(val => this.valueType.clone(val)) : undefined;
}

SType.register('SArray', SArray);
export { SArray };
