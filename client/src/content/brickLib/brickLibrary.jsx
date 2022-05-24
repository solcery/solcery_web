import { insertTable } from '../../utils';
import { SType } from '../types';
import { basicActions } from './index';
import { basicValues } from './index';
import { basicConditions } from './index';

function camelCase(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index)
  {
    return index === 0 ? word.toLowerCase() : word.toUpperCase();
  }).replace(/\s+/g, '');
}

export const paramFromMapEntry = (entry) => {
  const brickTypes = [ 'action', 'condition', 'value' ];
  return {
    code: camelCase(entry.key),
    name: entry.key,
    type: SType.from(`SBrick<${brickTypes[entry.value]}>`),
  }
}

export class BrickLibrary {
  bricks = {};

  addBrick(brickSignature) {
    let brick = Object.assign({}, brickSignature);
    brick.params = brickSignature.params.map(param => {
      let newParam = Object.assign({}, param);
      if (typeof newParam.type === 'string') newParam.type = SType.from(newParam.type);
      return newParam;
    })
    insertTable(this.bricks, brick, brick.lib, brick.func)
  }

  constructor() {
    basicActions.forEach(brick => this.addBrick(brick));
    basicConditions.forEach(brick => this.addBrick(brick));
    basicValues.forEach(brick => this.addBrick(brick));
  }
}

export default BrickLibrary;
