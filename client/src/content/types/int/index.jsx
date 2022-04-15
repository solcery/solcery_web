import { SType } from '../base'
import { ValueRender } from './components'

class SInt {
	static fromString = () => new SInt()
	valueRender = ValueRender;
	construct = (value, meta) => value;
	default = 0;
};


SType.register('SInt', SInt);
export { SInt }
