import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SBool {
	static fromString = () => new SBool();
	construct = (value, meta) => value;
	valueRender = ValueRender;
	filter = defaultFilter;
	default = () => false;
	eq = (a, b) => a === b;
}

SType.register('SBool', SBool);
export { SBool };
