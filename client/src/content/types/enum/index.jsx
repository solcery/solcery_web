import { SType } from '../base'
import { ValueRender } from './components'

class SEnum {
	constructor(data) {
		this.values = data.values;
	}
	valueRender = ValueRender;
	default = 0;
};

SType.register('SEnum', SEnum);
export { SEnum }
