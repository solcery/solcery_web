import { SType } from '../index';
import { ValueRender } from './components';
import { insertTable } from '../../../utils';

const constructType = (stringType) => {
  switch (stringType) {
    case 'action': return 0;
    case 'condition': return 1;
    case 'value': return 2;
    default: 
      throw new Error('Error constructing brick!');
  }
}

class SBrick {
  static fromString = data => new SBrick({ brickType: data });
  
  constructor(data) {
    this.brickType = data.brickType;
  }
  construct = (value, meta) => {
    let brickSignature = meta.brickLibrary.bricks[value.type][value.func];
    if (!brickSignature) throw new Error("Error constructing brick!");
    return {
      name: brickSignature.name,
      type: constructType(value.type),
      subtype: 100,
      params: brickSignature.params
        .filter(paramSig => value.params[paramSig.code])
        .map(paramSig => {
          let param = value.params[paramSig.code]
          return {
            name: paramSig.code,
            value: paramSig.type.construct(param, meta)
          }
        })
    }
  }
  valueRender = ValueRender;
  default = '';
};

SType.register('SBrick', SBrick);
export { SBrick }
