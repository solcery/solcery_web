import { SType } from '../base'
import { ValueRender } from './components'

class SBool {
  constructor(data) {}
  valueRender = ValueRender;
};

SType.register('SBool', SBool);

export { SBool }
