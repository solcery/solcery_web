import { SType } from '../base'
import { ValueRender } from './components'

class SBool {
  valueRender = ValueRender;
};

SType.register('SBool', SBool);
export { SBool }
