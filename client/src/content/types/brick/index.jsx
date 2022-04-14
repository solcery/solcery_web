import { SType } from '../base';
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

export const bricks = {}

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

addBrickSig({
  type: 'action',
  func: 'void',
  name: 'Void',
  params: [],
  run: () => {}
})

addBrickSig({
  type: 'action',
  func: 'two',
  name: 'Two actions',
  params: [
    { code: 'action1', name: 'Action #1', type: SType.from('SBrick<action>') },
    { code: 'action3', name: 'Action #2', type: SType.from('SBrick<action>') }
  ],
  run: (params, ctx) => {
    //applyBrick(params.action1, ctx)
    //applyBrick(params.action2, ctx)
  }
})

addBrickSig({
  type: 'action',
  func: 'string',
  name: 'String',
  params: [
    { code: 'str', name: 'String', type: SType.from('SString')},
  ],
  run: (params, ctx) => {
    //applyBrick(params.action1, ctx)
    //applyBrick(params.action2, ctx)
  }
})

addBrickSig({
  type: 'action',
  func: 'fourbools',
  name: 'Fourbools',
  params: [
    { code: 'bool1', name: 'Bool1', type: SType.from('SBool')},
    { code: 'bool2', name: 'Bool2', type: SType.from('SBool')},
    { code: 'bool3', name: 'Bool3', type: SType.from('SBool')},
    { code: 'bool4', name: 'Bool4', type: SType.from('SBool')},
  ],
  run: (params, ctx) => {
    //applyBrick(params.action1, ctx)
    //applyBrick(params.action2, ctx)
  }
})

addBrickSig({
  type: 'action',
  func: 'image',
  name: 'Image',
  params: [
    { code: 'image', name: 'Image', type: SType.from('SImage')},
  ],
  run: (params, ctx) => {
    //applyBrick(params.action1, ctx)
    //applyBrick(params.action2, ctx)
  }
})

addBrickSig({
  type: 'action',
  func: 'array',
  name: 'Array',
  params: [
    { code: 'array', name: 'Array', type: SType.from('SArray<SArray<SImage>>')},
  ],
  run: (params, ctx) => {
    //applyBrick(params.action1, ctx)
    //applyBrick(params.action2, ctx)
  }
})










// addBrickSig({
//   type: 'action',
//   func: 'void',
//   params: {
//     action1: []
//   }
// })


// addBrickSig({
//   type: 'action',
//   func: 'void',
//   name: 'Void',
//   run: () => {},
//   params: []
// })

// addBrickSig({
//   type: 'action',
//   func: 'two',
//   name: 'Two actions',
//   params: [
//     { code: 'action1', name: 'Action #1', type: SType.from({ name: "SBrick", data: { brickType: "action" } }) },
//     { code: 'action3', name: 'Action #2', type: SType.from({ name: "SBrick", data: { brickType: "action" } }) }
//   ],
//   run: (params, ctx) => {
//     //applyBrick(params.action1, ctx)
//     //applyBrick(params.action2, ctx)
//   }
// })

// addBrickSig({
//   type: 'action',
//   func: 'string',
//   name: 'String',
//   params: [
//     { code: 'str', name: 'String', type: SType.from('SString')},
//   ],
//   run: (params, ctx) => {
//     //applyBrick(params.action1, ctx)
//     //applyBrick(params.action2, ctx)
//   }
// })

// addBrickSig({
//   type: 'action',
//   func: 'fourbools',
//   name: 'Fourbools',
//   params: [
//     { code: 'bool1', name: 'Bool1', type: SType.from('SBool')},
//     { code: 'bool2', name: 'Bool2', type: SType.from('SBool')},
//     { code: 'bool3', name: 'Bool3', type: SType.from('SBool')},
//     { code: 'bool4', name: 'Bool4', type: SType.from('SBool')},
//   ],
//   run: (params, ctx) => {
//     //applyBrick(params.action1, ctx)
//     //applyBrick(params.action2, ctx)
//   }
// })

// addBrickSig({
//   type: 'action',
//   func: 'image',
//   name: 'Image',
//   params: [
//     { code: 'image', name: 'Image', type: SType.from('SImage')},
//   ],
//   run: (params, ctx) => {
//     //applyBrick(params.action1, ctx)
//     //applyBrick(params.action2, ctx)
//   }
// })


// export const applyBrick = (brick, ctx) => {
//   let params = {}
//   for (let param of brick.params) {
//     params[param.name] = param.value
//   }
//   if (brick.subtype > 10000) {
//     let func = (params, ctx) => {
//       ctx.args.push(params)
//       let result = applyBrick(ctx.game.content.get('customBricks', brick.subtype - 10000).brick, ctx)
//       ctx.args.pop()
//       return result
//     }
//     return func(params, ctx)
//   }
//   let brickSignature = getBasicBrickSignature(brick.type, brick.subtype)
//   if (!brickSignature)
//     throw new Error("Trying to apply unexistent brick")
//   return brickSignature.func(params, ctx)
// }

export * from './lib/action'