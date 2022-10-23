import { defaultFilter } from '../base';
import { ValueRender } from './components';

class SEnum {
	static fromString = (data) => new SEnum({ titles: data.split('|') });
	constructor(data) {
		this.titles = data.titles;
		this.values = data.values ?? Array.from(data.titles.keys());
	}
	construct = (value, meta) => value;
	valueRender = ValueRender;
	filter = defaultFilter;
	default = () => this.values[0];
	eq = (a, b) => a === b;
	clone = (a) => a;
}

export { SEnum };
