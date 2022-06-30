import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SEnum extends SType {
	static fromString = (data) => new SEnum({ titles: data.split('|') });
	constructor(data = {}) {
		super()
		this.titles = data.titles;
		this.values = data.values ?? Array.from(data.titles.keys());
	}
	valueRender = ValueRender;
	default = () => this.values[0];
}

SType.register('SEnum', SEnum);
export { SEnum };
