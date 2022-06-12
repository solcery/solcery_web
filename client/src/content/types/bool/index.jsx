import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SBool {
	static fromString = () => new SBool();
	construct = (value, meta) => value;
	valueRender = ValueRender;
	filter = defaultFilter;
	default = () => false;
}

SType.register('SBool', SBool);
export { SBool };
