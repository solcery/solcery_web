import { insertTable } from '../../utils';
import { basicActions } from './index';
import { basicValues } from './index';
import { basicConditions } from './index';



export const generic = {
  arg: (runtime, params, ctx) => {
    var args = ctx.args.pop()
    var result = runtime.execBrick(args[params.name], ctx)
    ctx.args.push(args)
    return result
  },

  shuffle: (array) => {
    for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
  }
};

export class BrickRuntime {
  bricks = {};
  constructor(content) {
    basicActions.forEach(brick => insertTable(this.bricks, brick, brick.type, brick.subtype))
    basicConditions.forEach(brick => insertTable(this.bricks, brick, brick.type, brick.subtype))
    basicValues.forEach(brick => insertTable(this.bricks, brick, brick.type, brick.subtype))
    if (!content) return;
    for (let obj of Object.values(content.customBricks)) {
      let brick = {
        type: obj.brick.type,
        subtype: 10000 + obj.id,
        exec: (runtime, params, ctx) => {
          ctx.args.push(params)
          let result = this.execBrick(obj.brick, ctx)
          ctx.args.pop()
          return result
        }
      } 
      insertTable(this.bricks, brick, obj.brick.type, 10000 + obj.id)
    }
  }

  context = (object, extra) => {
    var ctx = Object.assign({
      args: [],
      vars: {},
    }, extra);
    ctx.object = object
    return ctx
  }

  execBrick = (brick, ctx) => {
    let params: any = {}
    for (let param of brick.params) {
      params[param.name] = param.value
    }
    let func = this.bricks[brick.type][brick.subtype].exec
    return func(this, params, ctx)
  }
}
