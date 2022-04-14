import { SType } from '../base'
import { ValueRender } from './components'

class SBool {
  static fromString = () => new SBool();
  valueRender = ValueRender;
  default = false;
};

SType.register('SBool', SBool);
export { SBool }
