import { SType } from '../base'
import { ValueRender } from './components'

class SString {
	static fromString = () => new SString({});
	construct = (value, meta) => value;
	valueRender = ValueRender;
	default = '';
};

SType.register('SString', SString);
export { SString }
