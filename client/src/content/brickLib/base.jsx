import { insertTable } from '../../utils';
import { SType } from '../types';

export const runBrick = () => {}
export const generic = {}
const bricks = {}

export const addBricks = (bricksToAdd) => {
  Object.keys(bricksToAdd).forEach(brickType => {
    if (!bricks[brickType]) {
      bricks[brickType] = {};
    }
    Object.assign(bricks[brickType], bricksToAdd[brickType]); // TODO: error on overlapping keys
  })  
}

export const addBrickSig = (brickSig) => {
  insertTable(bricks, brickSig, brickSig.type, brickSig.func);
}

export class BrickLibrary {
  bricks = {};
  constructor() {
    Object.values(bricks).forEach(brickTypeLib => {
      Object.values(brickTypeLib).forEach(brick => {
        insertTable(this.bricks, brick.type, brick.subtype,)
        brick.params.forEach(param => {
          param.type = SType.from(param.type)
        })
      })
    })
  }
}

export const BrickLib = {
  load: function() {
    Object.values(bricks).forEach(brickTypeLib => {
      Object.values(brickTypeLib).forEach(brick => {
        brick.params.forEach(param => {
          param.type = SType.from(param.type)
        })
      })
    })
    this.loaded = true
  },

  getBricks: function() {
    if (!this.loaded) this.load();
    return bricks;
  },
  getBrick: function(type, func) {
    if (!this.loaded) this.load();
    let brickType = bricks[type];
    if (brickType) return undefined;
    return brickType[func];
  }
}

export default BrickLib;
