import { SType, defaultFilter } from '../base';
import { ValueRender } from './components';

class SInt extends SType {
	static fromString = () => new SInt();
	valueRender = ValueRender;
	default = () => 0;
	sort = (a, b) => a ?? 0 - b ?? 0;
}

SType.register('SInt', SInt);
export { SInt };
