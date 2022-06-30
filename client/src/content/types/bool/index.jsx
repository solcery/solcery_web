import { SType } from '../base';
import { ValueRender } from './components';

class SBool extends SType {
	static fromString = () => new SBool();
	valueRender = ValueRender;
	default = () => false;

	sort = (a, b) => +a- +b;
}

SType.register('SBool', SBool);
export { SBool };
