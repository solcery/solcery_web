import { SType } from '../base'
import { ValueRender } from './components'

class SArray {
	static fromString = data => new SArray({ valueType: data });
	constructor(data) {
		this.valueType = SType.from(data.valueType);
	}
	valueRender = ValueRender;
};

SType.register('SArray', SArray);
export { SArray }
