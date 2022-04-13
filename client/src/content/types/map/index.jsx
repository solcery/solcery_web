import { SType } from '../base'
import { ValueRender } from './components'

class SMap {
  constructor(data) {
    this.valueType = SType.from(data.valueType);
    this.keyType = SType.from(data.keyType);
  }
  valueRender = ValueRender;
};

SType.register('SMap', SMap);
export { SMap }
