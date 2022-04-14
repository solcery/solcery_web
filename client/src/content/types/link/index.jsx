import { SType } from '../base'
import { ValueRender } from './components'

class SLink {
  constructor(data) {
    this.templateCode = data.templateCode;
  }
  valueRender = ValueRender;
  default = undefined;
};

SType.register('SLink', SLink);
export { SLink }
