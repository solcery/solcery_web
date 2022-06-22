import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SDate {
	static fromString = (data) => new SDate({ time: data });
	constructor(data) {
		this.excludeTime = data.excludeTime;
	}

	valueRender = ValueRender;
	construct = (value, meta) => value;
	default = () => {
		let res = Date.now();
		if (this.excludeTime) {
			res.setHours(0, 0, 0, 0)
		}
		return res;
	}

	sorter = (a, b) => { 
		if (!a) a = 0; 
		if (!b) b = 0; 
		return a - b;  
	}
}

SType.register('SDate', SDate);
export { SDate };
