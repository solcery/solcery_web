import { SType } from '../../index';
import { ValueRender } from './components';

class SCustomBrick {
  static fromString = data => new SCustomBrick();
  
  construct = (value, meta) => {
    
    let objectId = meta.currentObject._id
    let intId = meta.linkToIds[objectId];
    if (!intId) {
      intId = Object.keys(meta.linkToIds).length + 1
      meta.linkToIds[objectId] = intId
    }

    // let brickSignature = bricks[value.type][value.func];
    // if (!brickSignature) throw new Error("Error constructing brick!");
    // return {
    //   name: brickSignature.name,
    //   type: constructBrickType(value.type),
    //   subtype: 100, // TODO:
    //   params: brickSignature.params
    //     .filter(paramSig => value.params[paramSig.code])
    //     .map(paramSig => {
    //       let param = value.params[paramSig.code]
    //       return {
    //         name: paramSig.code,
    //         value: paramSig.type.construct(param, meta)
    //       }
    //     })
    // }
  }
  valueRender = ValueRender;
  default = '';
};

SType.register('SCustomBrick', SCustomBrick);
export { SCustomBrick }

