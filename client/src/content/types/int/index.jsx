import { SType } from '../base'
import { ValueRender } from './components'

class SInt {
	valueRender = ValueRender;
};


SType.register('SInt', SInt);
export { SInt }
