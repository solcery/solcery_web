import { SType } from '../base';
import { ValueRender } from './components';

class SSound {
	static fromString = () => new SSound();
	constructor(data) {}
	construct = (value, meta) => value;
	valueRender = ValueRender;
	default = () => undefined;
	eq = (a, b) => a === b;
	clone = (a) => a;
}

SType.register('SSound', SSound);
export { SSound };
