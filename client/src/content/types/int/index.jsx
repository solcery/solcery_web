import { SType } from '../base'
import { ValueRender } from './components'

class SInt {
	valueRender = ValueRender;
	default = 0;
};


SType.register('SInt', SInt);
export { SInt }
