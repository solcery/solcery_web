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

    let brickSignature = bricks[value.type][value.func];
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

export const generic = {}

export const bricks = {}

export const defaultBricksByType = {}

generic.arg = () => {

}

generic.shuffle = (array) => {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

export const addBrickSig = (brickSig) => {
  insertTable(bricks, brickSig, brickSig.type, brickSig.func);
}

export const addBricks = (bricksToAdd) => {
  Object.keys(bricksToAdd).forEach(brickType => {
    if (!bricks[brickType]) {
      bricks[brickType] = {};
    }
    Object.assign(bricks[brickType], bricksToAdd[brickType]); // TODO: error on overlapping keys
  })  
}

export const runBrick = () => {

}

