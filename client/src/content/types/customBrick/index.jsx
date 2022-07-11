import { SType } from '../base';
import { ValueRender } from './components';
import schema from './schema.json';

class SCustomBrick {
	static fromString = () => new SCustomBrick();
	construct = (value, meta) => {
		if (!value) return;
		SType.from('SBrick').construct(value.brickTree, meta);
	}
	valueRender = ValueRender;
	default = () => undefined;
	eq = (a, b) => {

		if (a === b) return true;
		if (a && !b) return false;
		if (b && !a) return false;
		return JSON.stringify(a) === JSON.stringify(b)
	}
	clone = (value) => {
		if (value === undefined) return undefined;
		return JSON.parse(JSON.stringify(value))
	}
}

SType.register('SCustomBrick', SCustomBrick);
export { SCustomBrick };
