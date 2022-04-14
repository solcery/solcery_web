import { SType } from '../types';
import { runBrick, addBrickSig, generic } from '../types/brick';

addBrickSig({
  type: 'value',
  func: 0,
  name: 'Constant',
  params: [
    { code: 'value', name: 'Value', type: SType.from('SInt') }
  ],
  run: (params, ctx) => {
    return params.value
  }
})

// value.attr
addBrickSig({
  type: 'value',
  func: 1,
  name: 'Variable',
  params: [
    { code: 'var_name', name: 'Variable name', type: SType.from('SString') }
  ],
  run: (params, ctx) => {
    let res = ctx.vars[params.var_name]
    return res ? res : 0
  }
})

// value.attr
addBrickSig({
  type: 'value',
  func: 'value',
  name: 'Attribute',
  params: [
    { code: 'attr_name', name: 'Attribute name', type: SType.from('SString') }
  ],
  run: (params, ctx) => {
    return ctx.object.attrs[params.attr_name]
  }
})

addBrickSig({
  type: 'value',
  func: 'arg',
  name: 'Argument',
  params: [
    { code: 'name', name: 'Name', type: SType.from('SString') },
  ],
  func: generic.arg,
})

// value.conditional
addBrickSig({
  type: 'value',
  func: 'if_then',
  name: 'If-Then-Else',
  params: [
    { code: 'if', name: 'If', type: SType.from('SBrick<condition>') },
    { code: 'then', name: 'Then', type: SType.from('SBrick<value>') },
    { code: 'else', name: 'Else', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    if (runBrick(params.if, ctx))
      return runBrick(params.then, ctx)
    else
      return runBrick(params.else, ctx)
  }
})

addBrickSig({
  type: 'value',
  func: 'add',
  name: 'Addition',
  params: [
    { code: 'value1', name: 'Value #1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value #2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let v1 = runBrick(params.value1, ctx)
    let v2 = runBrick(params.value2, ctx)
    return v1 + v2  
  }
})

addBrickSig({
  type: 'value',
  func: 'sub',
  name: 'Subtraction',
  params: [
    { code: 'value1', name: 'Value #1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value #2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let v1 = runBrick(params.value1, ctx)
    let v2 = runBrick(params.value2, ctx)
    return v1 - v2
  }
})

addBrickSig({
  type: 'value',
  func: 'mul',
  name: 'Multiplication',
  params: [
    { code: 'value1', name: 'Value #1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value #2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let v1 = runBrick(params.value1, ctx)
    let v2 = runBrick(params.value2, ctx)
    return v1 * v2
  }
})

addBrickSig({
  type: 'value',
  func: 8,
  name: 'Division',
  params: [
    { code: 'value1', name: 'Value #1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value #2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let v1 = runBrick(params.value1, ctx)
    let v2 = runBrick(params.value2, ctx)
    return Math.floor(v1 / v2) 
  }
})

addBrickSig({
  type: 'value',
  func: 'mod',
  name: 'Modulo',
  params: [
    { code: 'value1', name: 'Value #1', type: SType.from('SBrick<value>') },
    { code: 'value2', name: 'Value #2', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let v1 = runBrick(params.value1, ctx)
    let v2 = runBrick(params.value2, ctx)
    return v1 - (Math.floor(v1 / v2) * v2)
  }
})

addBrickSig({
  type: 'value',
  func: 'random',
  name: 'Random',
  params: [
    { code: 'from', name: 'From', type: SType.from('SBrick<value>') },
    { code: 'to', name: 'To', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let min = runBrick(params.from, ctx)
    let max = runBrick(params.to, ctx) + 1
    return min + Math.floor(Math.random() * (max - min));
  }
})

addBrickSig({
  type: 'value',
  func: 'entity_id',
  name: 'Card Id',
  params: [],
  run: (params, ctx) => {
    return ctx.object.id
  }
})

addBrickSig({
  type: 'value',
  func: 'tpl_id',
  name: 'Card type Id',
  params: [],
  run: (params, ctx) => {
    return ctx.object.tplId
  }
})

// value.attr
addBrickSig({
  type: 'value',
  func: 'game_attr',
  name: 'Game Attribute',
  params: [
    { code: 'attr_name', name: 'Attribute name', type: SType.from('SString') }
  ],
  run: (params, ctx) => {
    return ctx.game.attrs[params.attr_name]
  }
})

addBrickSig({ // TODO: reuse code
  type: 'value',
  func: 'iter_sum',
  name: 'Sum Iterator',
  params: [
    { code: 'iter_condition',name: 'Iteration Condition', type: SType.from('SBrick<condition>') },
    { code: 'target_value',name: 'Target Value', type: SType.from('SBrick<value>') },
    { code: 'limit', name: 'Limit', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let limit = runBrick(params.limit, ctx)
    let objs = []
    let oldObj = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    generic.shuffle(objects)
    while (limit > 0 && objects.length > 0) {
      ctx.object = objects.pop()
      if (runBrick(params.iter_condition, ctx)) {
        objs.push(ctx.object)
        limit--;
      }
    }
    let result = 0
    for (let obj of objs) {
      ctx.object = obj
      result = result + runBrick(params.target_value, ctx)
    }
    ctx.object = oldObj
    return result
  }
})

addBrickSig({
  type: 'value',
  func: 'set_var',
  name: 'Set variable',
  params: [
    { code: 'var_name', name: 'Var name', type: SType.from('SString') },
    { code: 'value', name: 'Value', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let varName = params.var_name
    let value = params.value
    ctx.vars[varName] = runBrick(value, ctx)
    return ctx.vars[varName]
  }
})

addBrickSig({ // TODO: reuse code
  type: 'value',
  func: 'iter_max',
  name: 'Max Iterator',
  params: [
    { code: 'iter_condition',name: 'Iteration Condition', type: SType.from('SBrick<condition>') },
    { code: 'value',name: 'Value', type: SType.from('SBrick<value>') },
    { code: 'fallback', name: 'Fallback', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let old_object = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    generic.shuffle(objects)
    let result = Number.NEGATIVE_INFINITY
    for (let obj of objects) {
      if (runBrick(params.iter_condition, ctx)) {
        result = Math.min(runBrick(params.value, ctx), result)
      }
    }
    ctx.object = old_object
    if (result == Number.NEGATIVE_INFINITY) {
      result = runBrick(params.fallback, ctx)
    }
    return result
  }
})

addBrickSig({ // TODO: reuse code
  type: 'value',
  func: 'iter_max',
  name: 'Min Iterator',
  params: [
    { code: 'iter_condition',name: 'Iteration Condition', type: SType.from('SBrick<condition>') },
    { code: 'value',name: 'Value', type: SType.from('SBrick<value>') },
    { code: 'fallback', name: 'Fallback', type: SType.from('SBrick<value>') }
  ],
  run: (params, ctx) => {
    let old_object = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    generic.shuffle(objects)
    let result = Number.POSITIVE_INFINITY
    for (let obj of objects) {
      if (runBrick(params.iter_condition, ctx)) {
        result = Math.max(runBrick(params.value, ctx), result)
      }
    }
    ctx.object = old_object
    if (result == Number.POSITIVE_INFINITY) {
      result = runBrick(params.fallback, ctx)
    }
    return result
  }
})