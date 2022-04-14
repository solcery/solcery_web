import { SType } from '../base'
import { ValueRender } from './components'

const MAP_TYPES_DELIMETER = '=>';

class SMap {
  static fromString = data => {
    let typeDatas = data.spilit(MAP_TYPES_DELIMETER);
    return new SMap({
      keyType: typeDatas[0],
      valueType: typeDatas[1],
    })
  }
  constructor(data) {
    this.valueType = SType.from(data.valueType);
    this.keyType = SType.from(data.keyType);
  }
  valueRender = ValueRender;
  default = [];
};

SType.register('SMap', SMap);
export { SMap }
