import { SType } from '../../index';
import { ValueRender } from './components';

class SBrick {
  static fromString = data =>  new SBrick({ brickType: data });

  constructor(data) {
    this.brickType = data.brickType;
    this.params = data.params;
  }

  construct = (value, meta) => {
    let v = value;
    if (value.brickType) v = value.brickTree; //For top-level brickTree and custom bricks
    if (!v) return undefined;
    let brickSignature = meta.brickLibrary[v.lib][v.func];
    if (!brickSignature) throw new Error(`Error constructing brick [${v.lib}.${v.func}] - no signature found!`);
    if (meta.target === 'unity') {
      return {
        name: brickSignature.name,
        type: brickSignature.type,
        subtype: brickSignature.subtype, 
        params: brickSignature.params 
          .filter(paramSig => v.params[paramSig.code] !== undefined)
          .map(paramSig => {
            let param = v.params[paramSig.code]
            return {
              name: paramSig.code,
              value: paramSig.type.construct(param, meta)
            }
          })
      }
    }
    if (meta.target === 'web') {
      return {
        lib: brickSignature.lib,
        func: brickSignature.func,
        params: Object.fromEntries(brickSignature.params 
          .filter(paramSig => v.params[paramSig.code] !== undefined)
          .map(paramSig => [
            paramSig.code,
            paramSig.type.construct(v.params[paramSig.code], meta)
          ]))
      }
    }
  }
  valueRender = ValueRender;
  default = '';
};

SType.register('SBrick', SBrick);
export { SBrick }

