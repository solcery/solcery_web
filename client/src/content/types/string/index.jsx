import { SType } from '../base'
import { ValueRender } from './components'

class SString {
	valueRender = ValueRender;
	default = '';
};

SType.register('SString', SString);
export { SString }
