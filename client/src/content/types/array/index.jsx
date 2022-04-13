import { SType } from '../base'
import { ValueRender } from './components'

class SArray {
	constructor(data) {
		this.valueType = SType.from(data.valueType);
	}
	valueRender = ValueRender;
};

SType.register('SArray', SArray);
export { SArray }
