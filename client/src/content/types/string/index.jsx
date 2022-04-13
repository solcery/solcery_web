import { SType } from '../base'
import { ValueRender } from './components'

class SString {
	constructor(data) {};
	valueRender = ValueRender;
};

SType.register('SString', SString);
export { SString }
