import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';
import moment from 'moment';

class SDate extends SType {
	static fromString = (data) => new SDate({ excludeTime: data === 'excludeTime' });

	constructor(data = {}) {
		super();
		this.excludeTime = data.excludeTime;
	}

	valueRender = ValueRender;
	
	default = () => {
		let res = Date.now();
		if (this.excludeTime) {
			res.setHours(0, 0, 0, 0)
		}
		return res;
	}

	sort = (a, b) => a ?? 0 - b ?? 0;
}

SType.register('SDate', SDate);
export { SDate };
