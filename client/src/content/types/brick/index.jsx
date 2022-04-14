import { SType } from '../index';
import { ValueRender } from './components';
import { insertTable } from '../../../utils';

class SBrick {
  static fromString = data => new SBrick({ brickType: data });
  
  constructor(data) {
    this.brickType = data.brickType;
  }
  valueRender = ValueRender;
  default = '';
};

SType.register('SBrick', SBrick);
export { SBrick }

export const generic = {}

export const bricks = {}

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
  insertTable(bricks, [ brickSig.type, brickSig.func ], brickSig);
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

