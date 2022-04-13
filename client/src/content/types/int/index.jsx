import { SType } from '../base'
import { ValueRender } from './components'

class SInt {
	constructor(data) {};
	valueRender = ValueRender;
};


SType.register('SInt', SInt);
export { SInt }
