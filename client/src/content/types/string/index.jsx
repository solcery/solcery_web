import { SType } from '../base'
import { ValueRender } from './components'

class SString {
	static fromString = () => new SString({})
	valueRender = ValueRender;
	default = '';
};

SType.register('SString', SString);
export { SString }
