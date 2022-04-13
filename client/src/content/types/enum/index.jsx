import { SType } from '../base'
import { ValueRender } from './components'

class SEnum {
	constructor(data) {
		this.values = data.values;
	}
	valueRender = ValueRender;
};


SType.registe('SEnum', SEnum);
export { SEnum }
