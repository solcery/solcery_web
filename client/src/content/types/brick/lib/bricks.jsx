



//condition.const
basicBricks.push({
  type: 1,
  subtype: 0,
  name: 'Constant',
  params: [
    { id: 1, code: 'value', name: 'Value', type: new SBool() }, //TODO
  ],
  func: (params, ctx) => {
    return params.value != 0
  }
})

//condition.const
basicBricks.push({
  type: 1,
  subtype: 1,
  name: 'Not',
  params: [
    { id: 1, code: 'condition', name: 'Condition', type: new SBrick({ brickType: 1 }) }, //TODO
  ],
  func: (params, ctx) => {
    return !applyBrick(params.condition, ctx)
  }
})

//condition.equal
basicBricks.push({
  type: 1,
  subtype: 2,
  name: 'Equal',
  params: [
    { id: 1, code: 'value1', name: 'Value1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    return applyBrick(params.value1, ctx) === applyBrick(params.value2, ctx)
  }
})

//condition.equal
basicBricks.push({
  type: 1,
  subtype: 3,
  name: 'Greater than',
  params: [
    { id: 1, code: 'value1', name: 'Value1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    return applyBrick(params.value1, ctx) > applyBrick(params.value2, ctx)
  }
})

//condition.lesserThan
basicBricks.push({
  type: 1,
  subtype: 4,
  name: 'Lesser than',
  params: [
    { id: 1, code: 'value1', name: 'Value1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    return applyBrick(params.value1, ctx) < applyBrick(params.value2, ctx)
  }
})

basicBricks.push({
  type: 1,
  subtype: 5,
  name: 'Argument',
  params: [
    { id: 1, code: 'name', name: 'Name', type: new SString() },
  ],
  func: argFunc,
})

basicBricks.push({
  type: 1,
  subtype: 6,
  name: 'Or',
   params: [
    { id: 1, code: 'cond1', name: 'Cond #1', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'cond2', name: 'Cond #2', type: new SBrick({ brickType: 1 }) }
  ],
  func: (params, ctx) => {
    return applyBrick(params.cond1, ctx) || applyBrick(params.cond2, ctx)
  },
})

basicBricks.push({
  type: 1,
  subtype: 7,
  name: 'And',
   params: [
    { id: 1, code: 'cond1', name: 'Cond #1', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'cond2', name: 'Cond #2', type: new SBrick({ brickType: 1 }) }
  ],
  func: (params, ctx) => {
    return applyBrick(params.cond1, ctx) && applyBrick(params.cond2, ctx)
  },
})


basicBricks.push({ // TODO: reuse code
  type: 1,
  subtype: 8,
  name: 'OR Iterator',
  params: [
    { id: 1, code: 'iter_condition',name: 'Iteration Condition', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'condition',name: 'Condition', type: new SBrick({ brickType: 1 }) },
    { id: 3, code: 'limit', name: 'Limit', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let limit = applyBrick(params.limit, ctx)
    let objs = []
    let oldObj = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    shuffleArray(objects)
    while (limit > 0 && objects.length > 0) {
      ctx.object = objects.pop()
      if (applyBrick(params.iter_condition, ctx)) {
        objs.push(ctx.object)
        limit--;
      }
    }
    let result = false
    for (let obj of objs) {
      ctx.object = obj
      result = result || applyBrick(params.condition, ctx)
    }
    ctx.object = oldObj
    return result
  }
})

basicBricks.push({ // TODO: reuse code
  type: 1,
  subtype: 9,
  name: 'AND Iterator',
  params: [
    { id: 1, code: 'iter_condition',name: 'Iteration Condition', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'condition',name: 'Condition', type: new SBrick({ brickType: 1 }) },
    { id: 3, code: 'limit', name: 'Limit', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let limit = applyBrick(params.limit, ctx)
    let objs = []
    let oldObj = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    shuffleArray(objects)
    while (limit > 0 && objects.length > 0) {
      ctx.object = objects.pop()
      if (applyBrick(params.iter_condition, ctx)) {
        objs.push(ctx.object)
        limit--;
      }
    }
    let result = true
    for (let obj of objs) {
      ctx.object = obj
      result = result && applyBrick(params.condition, ctx)
    }
    ctx.object = oldObj
    return result
  }
})

basicBricks.push({
  type: 2,
  subtype: 0,
  name: 'Constant',
  params: [
    { id: 1, code: 'value', name: 'Value', type: new SInt() }
  ],
  func: (params, ctx) => {
    return params.value
  }
})

// value.attr
basicBricks.push({
  type: 2,
  subtype: 1,
  name: 'Variable',
  params: [
    { id: 1, code: 'var_name', name: 'Variable name', type: new SString() }
  ],
  func: (params, ctx) => {
    let res = ctx.vars[params.var_name]
    return res ? res : 0
  }
})

// value.attr
basicBricks.push({
  type: 2,
  subtype: 2,
  name: 'Attribute',
  params: [
    { id: 1, code: 'attr_name', name: 'Attribute name', type: new SString() }
  ],
  func: (params, ctx) => {
    return ctx.object.attrs[params.attr_name]
  }
})

basicBricks.push({
  type: 2,
  subtype: 3,
  name: 'Argument',
  params: [
    { id: 1, code: 'name', name: 'Name', type: new SString() },
  ],
  func: argFunc,
})

// value.conditional
basicBricks.push({
  type: 2,
  subtype: 4,
  name: 'If-Then-Else',
  params: [
    { id: 1, code: 'if', name: 'If', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'then', name: 'Then', type: new SBrick({ brickType: 2 }) },
    { id: 3, code: 'else', name: 'Else', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    if (applyBrick(params.if, ctx))
      return applyBrick(params.then, ctx)
    else
      return applyBrick(params.else, ctx)
  }
})

basicBricks.push({
  type: 2,
  subtype: 5,
  name: 'Addition',
  params: [
    { id: 1, code: 'value1', name: 'Value #1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value #2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let v1 = applyBrick(params.value1, ctx)
    let v2 = applyBrick(params.value2, ctx)
    return v1 + v2  
  }
})

basicBricks.push({
  type: 2,
  subtype: 6,
  name: 'Subtraction',
  params: [
    { id: 1, code: 'value1', name: 'Value #1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value #2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let v1 = applyBrick(params.value1, ctx)
    let v2 = applyBrick(params.value2, ctx)
    return v1 - v2
  }
})

basicBricks.push({
  type: 2,
  subtype: 7,
  name: 'Multiplication',
  params: [
    { id: 1, code: 'value1', name: 'Value #1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value #2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let v1 = applyBrick(params.value1, ctx)
    let v2 = applyBrick(params.value2, ctx)
    return v1 * v2
  }
})

basicBricks.push({
  type: 2,
  subtype: 8,
  name: 'Division',
  params: [
    { id: 1, code: 'value1', name: 'Value #1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value #2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let v1 = applyBrick(params.value1, ctx)
    let v2 = applyBrick(params.value2, ctx)
    return Math.floor(v1 / v2) 
  }
})

basicBricks.push({
  type: 2,
  subtype: 9,
  name: 'Modulo',
  params: [
    { id: 1, code: 'value1', name: 'Value #1', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'value2', name: 'Value #2', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let v1 = applyBrick(params.value1, ctx)
    let v2 = applyBrick(params.value2, ctx)
    return v1 - (Math.floor(v1 / v2) * v2)
  }
})

basicBricks.push({
  type: 2,
  subtype: 10,
  name: 'Random',
  params: [
    { id: 1, code: 'from', name: 'From', type: new SBrick({ brickType: 2 }) },
    { id: 2, code: 'to', name: 'To', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let min = applyBrick(params.from, ctx)
    let max = applyBrick(params.to, ctx) + 1
    return min + Math.floor(Math.random() * (max - min));
  }
})

basicBricks.push({
  type: 2,
  subtype: 11,
  name: 'Card Id',
  params: [],
  func: (params, ctx) => {
    return ctx.object.id
  }
})

basicBricks.push({
  type: 2,
  subtype: 12,
  name: 'Card type Id',
  params: [],
  func: (params, ctx) => {
    return ctx.object.tplId
  }
})

// value.attr
basicBricks.push({
  type: 2,
  subtype: 13,
  name: 'Game Attribute',
  params: [
    { id: 1, code: 'attr_name', name: 'Attribute name', type: new SString() }
  ],
  func: (params, ctx) => {
    return ctx.game.attrs[params.attr_name]
  }
})

basicBricks.push({ // TODO: reuse code
  type: 2,
  subtype: 14,
  name: 'Sum Iterator',
  params: [
    { id: 1, code: 'iter_condition',name: 'Iteration Condition', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'target_value',name: 'Target Value', type: new SBrick({ brickType: 2 }) },
    { id: 3, code: 'limit', name: 'Limit', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let limit = applyBrick(params.limit, ctx)
    let objs = []
    let oldObj = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    shuffleArray(objects)
    while (limit > 0 && objects.length > 0) {
      ctx.object = objects.pop()
      if (applyBrick(params.iter_condition, ctx)) {
        objs.push(ctx.object)
        limit--;
      }
    }
    let result = 0
    for (let obj of objs) {
      ctx.object = obj
      result = result + applyBrick(params.target_value, ctx)
    }
    ctx.object = oldObj
    return result
  }
})

basicBricks.push({
  type: 2,
  subtype: 15,
  name: 'Set variable',
  params: [
    { id: 1, code: 'var_name', name: 'Var name', type: new SString() },
    { id: 2, code: 'value', name: 'Value', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let varName = params.var_name
    let value = params.value
    ctx.vars[varName] = applyBrick(value, ctx)
    return ctx.vars[varName]
  }
})

basicBricks.push({ // TODO: reuse code
  type: 2,
  subtype: 16,
  name: 'Max Iterator',
  params: [
    { id: 1, code: 'iter_condition',name: 'Iteration Condition', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'value',name: 'Value', type: new SBrick({ brickType: 2 }) },
    { id: 3, code: 'fallback', name: 'Fallback', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let old_object = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    shuffleArray(objects)
    let result = Number.NEGATIVE_INFINITY
    for (let obj of objects) {
      if (applyBrick(params.iter_condition, ctx)) {
        result = Math.min(applyBrick(params.value, ctx), result)
      }
    }
    ctx.object = old_object
    if (result == Number.NEGATIVE_INFINITY) {
      result = applyBrick(params.fallback, ctx)
    }
    return result
  }
})

basicBricks.push({ // TODO: reuse code
  type: 2,
  subtype: 17,
  name: 'Min Iterator',
  params: [
    { id: 1, code: 'iter_condition',name: 'Iteration Condition', type: new SBrick({ brickType: 1 }) },
    { id: 2, code: 'value',name: 'Value', type: new SBrick({ brickType: 2 }) },
    { id: 3, code: 'fallback', name: 'Fallback', type: new SBrick({ brickType: 2 }) }
  ],
  func: (params, ctx) => {
    let old_object = ctx.object 
    let amount = 0
    let objects = [...ctx.game.objects.values()]
    shuffleArray(objects)
    let result = Number.POSITIVE_INFINITY
    for (let obj of objects) {
      if (applyBrick(params.iter_condition, ctx)) {
        result = Math.max(applyBrick(params.value, ctx), result)
      }
    }
    ctx.object = old_object
    if (result == Number.POSITIVE_INFINITY) {
      result = applyBrick(params.fallback, ctx)
    }
    return result
  }
})
