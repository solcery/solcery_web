import { SType } from '../types';
import { runBrick, addBrickSig, generic } from '../types/brick';

//condition.const
addBrickSig({
  type: 'condition',
  func: 'const',
  name: 'Constant',
  params: [
    { code: 'value', name: 'Value', type: SType.from('SBool') }, //TODO
  ],
  run: (params, ctx) => {
    return params.value
  }
})

//condition.const
addBrickSig({
  type: 'condition',
  func: 'not',
  name: 'Not',
  params: [
    { code: 'condition', name: 'Condition', type: SType.from('SBrick<condition>') }, //TODO
  ],
  run: (params, ctx) => {
    return !runBrick(params.condition, ctx)
  }
})

//condition.equal
addBrickSig({
  type: 'condition',
  func: 'eq',
  name: 'Equal',
  params: [
    { code: 'value1', name: 'Value1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    return runBrick(params.value1, ctx) === runBrick(params.value2, ctx)
  }
})

//condition.equal
addBrickSig({
  type: 'condition',
  func: 'gt',
  name: 'Greater than',
  params: [
    { code: 'value1', name: 'Value1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    return runBrick(params.value1, ctx) > runBrick(params.value2, ctx)
  }
})

//condition.lesserThan
addBrickSig({
  type: 'condition',
  func: 'lt',
  name: 'Lesser than',
  params: [
    { code: 'value1', name: 'Value1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    return runBrick(params.value1, ctx) < runBrick(params.value2, ctx)
  }
})

addBrickSig({
  type: 'condition',
  func: 'arg',
  name: 'Argument',
  params: [
    { code: 'name', name: 'Name', type: SType.from('SString') },
  ],
  run: generic.arg,
})

addBrickSig({
  type: 'condition',
  func: 'or',
  name: 'Or',
   params: [
    { code: 'cond1', name: 'Cond #1', type: SType.from('SBrick<condition>') },
    { code: 'cond2', name: 'Cond #2', type: SType.from('SBrick<condition>') }
  ],
  run: (params, ctx) => {
    return runBrick(params.cond1, ctx) || runBrick(params.cond2, ctx)
  },
})

addBrickSig({
  type: 'condition',
  func: 'and',
  name: 'And',
   params: [
    { code: 'cond1', name: 'Cond #1', type: SType.from('SBrick<condition>') },
    { code: 'cond2', name: 'Cond #2', type: SType.from('SBrick<condition>') }
  ],
  run: (params, ctx) => {
    return runBrick(params.cond1, ctx) && runBrick(params.cond2, ctx)
  },
})


addBrickSig({ // TODO: reuse code
  type: 'condition',
  func: 'iter_or',
  name: 'OR Iterator',
  params: [
    { code: 'iter_condition',name: 'Iteration Condition', type: SType.from('SBrick<condition>') },
    { code: 'condition',name: 'Condition', type: SType.from('SBrick<condition>') },
    { code: 'limit', name: 'Limit', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let limit = runBrick(params.limit, ctx)
    let objs = []
    let oldObj = ctx.object
    let objects = [...ctx.game.objects.values()]
    generic.shuffle (objects)
    while (limit > 0 && objects.length > 0) {
      ctx.object = objects.pop()
      if (runBrick(params.iter_condition, ctx)) {
        objs.push(ctx.object)
        limit--;
      }
    }
    let result = false
    for (let obj of objs) {
      ctx.object = obj
      result = result || runBrick(params.condition, ctx)
    }
    ctx.object = oldObj
    return result
  }
})

addBrickSig({ // TODO: reuse code
  type: 'condition',
  func: 'iter_and',
  name: 'AND Iterator',
  params: [
    { code: 'iter_condition',name: 'Iteration Condition', type: SType.from('SBrick<condition>') },
    { code: 'condition',name: 'Condition', type: SType.from('SBrick<condition>') },
    { code: 'limit', name: 'Limit', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let limit = runBrick(params.limit, ctx)
    let objs = []
    let oldObj = ctx.object
    let objects = [...ctx.game.objects.values()]
    generic.shuffle (objects)
    while (limit > 0 && objects.length > 0) {
      ctx.object = objects.pop()
      if (runBrick(params.iter_condition, ctx)) {
        objs.push(ctx.object)
        limit--;
      }
    }
    let result = true
    for (let obj of objs) {
      ctx.object = obj
      result = result && runBrick(params.condition, ctx)
    }
    ctx.object = oldObj
    return result
  }
})