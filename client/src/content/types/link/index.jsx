import { SType } from '../base'
import { ValueRender } from './components'
import { getTable, insertTable } from '../../../utils'

class SLink {
  static fromString = data => new SLink({ templateCode: data });

  constructor(data) {
    this.templateCode = data.templateCode;
  }

  construct = (value, meta) => {
    let intId = meta.linkToIds[value];
    if (!intId) {
      intId = Object.keys(meta.linkToIds).length + 1
      meta.linkToIds[value] = intId
    }
    return intId
  };

  valueRender = ValueRender;
  default = undefined;
};

SType.register('SLink', SLink);
export { SLink }
