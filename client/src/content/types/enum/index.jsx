import { SType } from '../base'
import { ValueRender } from './components'

class SEnum {
	static fromString = data => new SEnum({ titles: data.split('|') });
	constructor(data) {
		this.titles = data.titles;
		this.values = data.values ?? Array.from(data.titles.keys());
	}
	construct = (value, meta) => value;
	valueRender = ValueRender;
	default = () => this.values[0];
};

SType.register('SEnum', SEnum);
export { SEnum }
