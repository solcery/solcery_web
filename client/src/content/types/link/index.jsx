import { SType } from '../base';
import { ValueRender } from './components';

class SLink {
  static fromString = data => new SLink({ templateCode: data });

  constructor(data) {
    this.templateCode = data.templateCode;
  }

  construct = (value, meta) => meta.getIntId(value);
  
  valueRender = ValueRender;
  default = undefined;
};

SType.register('SLink', SLink);
export { SLink }
