import { SType } from '../base'
import { ValueRender } from './components'

class SString {
	valueRender = ValueRender;
};

SType.register('SString', SString);
export { SString }
