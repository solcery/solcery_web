import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SInt {
	static fromString = () => new SInt();
	valueRender = ValueRender;
	construct = (value, meta) => value;
	filter = defaultFilter;
	default = () => 0;
	sorter = (a, b) => {
		if (!a) a = 0;
		if (!b) b = 0;
		return a - b;
	};
	eq = (a, b) => {
		if (!a) a = 0;
		if (!b) b = 0;
		console.log(a, b);
		return a === b;
	};
	clone = (a) => a;
}

SType.register('SInt', SInt);
export { SInt };
