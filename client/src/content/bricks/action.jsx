import { SType } from '../types';
import { runBrick, addBrickSig, generic } from '../types/brick';

addBrickSig({
	type: 'action',
	func: 'two',
	name: 'Two actions',
	params: [
		{ code: 'action1', name: 'Action #1', type: SType.from('SBrick<action>') },
		{ code: 'action2', name: 'Action #2', type: SType.from('SBrick<action>') }
	],
	run: (params, ctx) => {
		runBrick(params.action1, ctx)
		runBrick(params.action2, ctx)
	}
})

addBrickSig({
	type: 'action',
	func: 'void',
	name: 'Void',
 	params: [],
	run: () => {}
})


addBrickSig({
	type: 'action',
	func: 'if_then',
	name: 'If-Then-Else',
	params: [
		{ code: 'if', name: 'If', type: SType.from('SBrick<condition>') },
		{ code: 'then', name: 'Then', type: SType.from('SBrick<action>') },
		{ code: 'else', name: 'Else', type: SType.from('SBrick<action>') }
	],
	run: (params, ctx) => {
		if (runBrick(params.if, ctx)) {
			runBrick(params.then, ctx)
		}
		else {
			runBrick(params.else, ctx)
		}
	}
})

addBrickSig({
	type: 'action',
	func: 'loop',
	name: 'Loop',
	params: [
		{ code: 'counter_var', name: 'Counter var', type: SType.from('SString') },
		{ code: 'iterations', name: 'Iterations', type: SType.from('SBrick<value>') },
		{ code: 'action', name: 'Action', type: SType.from('SBrick<action>') },
	],
	run: (params, ctx) => {
		let iter = runBrick(params.iterations, ctx)
		for (let i = 0; i < iter; i++) {
			ctx.vars[params.counter_var] = i; //TODO: cleanup
			runBrick(params.action, ctx);
		}
	}
})

addBrickSig({
	type: 'action',
	func: 'arg',
	name: 'Argument',
	params: [
		{ code: 'name', name: 'Name', type: SType.from('SString') },
	],
	run: generic.arg,
})

addBrickSig({
	type: 'action',
	func: 'iter',
	name: 'Iterator',
	params: [
		{ code: 'condition',name: 'Condition', type: SType.from('SBrick<condition>') },
		{ code: 'action',name: 'Action', type: SType.from('SBrick<action>') },
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
			if (runBrick(params.condition, ctx)) {
				objs.push(ctx.object)
				limit--;
			}
		}
		for (let obj of objs) {
			ctx.object = obj
			runBrick(params.action, ctx)
		}
		ctx.object = oldObj
	}
})

addBrickSig({
	type: 'action',
	func: 'set_var',
	name: 'Set variable',
	params: [
		{ code: 'var_name', name: 'Var', type: SType.from('SString') },
		{ code: 'value', name: 'Value', type: SType.from('SBrick<value>') }
	],
	run: (params, ctx) => {
		let varName = params.var_name
		let value = params.value
		ctx.vars[varName] = runBrick(value, ctx)
	}
})

addBrickSig({
	type: 'action',
	func: 'set_attr',
	name: 'Set attribute',
	params: [
		{ code: 'attr_name', name: 'Attr', type: SType.from('SString') },
		{ code: 'value', name: 'Value', type: SType.from('SBrick<value>') }
	],
	run: (params, ctx) => {
		let attrName = params.attr_name
		let value = runBrick(params.value, ctx)
		if (ctx.object.attrs[attrName] === undefined)
			throw new Error("trying to set unknown attr " + attrName)
		ctx.object.attrs[attrName] = value
		if (ctx.diff) {
			let objectId = ctx.object.id
			if (!ctx.diff.objects[objectId]) {
				ctx.diff.objects[objectId] = {
					id: objectId,
					tplId: ctx.object.tplId,
					attrs: {}
				}
			}
			ctx.diff.objects[objectId].attrs[attrName] = value
		}
	}
})


addBrickSig({
	type: 'action',
	func: 'use_card',
	name: 'Use card',
	params: [],
	run: (params, ctx) => {
		let tplId = ctx.object.tplId
		let cardType = ctx.game.content.get('cardTypes', tplId)
		if (cardType.action) {
			runBrick(cardType.action, ctx)
		}
	}
})

addBrickSig({
	type: 'action',
	func: 'set_game_attr',
	name: 'Set game attribute',
	params: [
		{ code: 'attr_name', name: 'Attr', type: SType.from('SString') },
		{ code: 'value', name: 'Value', type: SType.from('SBrick<value>') }
	],
	run: (params, ctx) => {
		let attrName = params.attr_name
		let value = runBrick(params.value, ctx)
		if (ctx.game.attrs[attrName] === undefined)
			throw new Error("Trying to set unknown game attr " + attrName)
		ctx.game.attrs[attrName] = value
		if (ctx.diff) {
			ctx.diff.attrs[attrName] = value
		}
	}
})

addBrickSig({
	type: 'action',
	func: 'pause',
	name: 'Pause',
	params: [
		{ code: 'duration', name: 'Duration', type: SType.from('SBrick<value>') }, 
	],
	run: (params, ctx) => {
		let duration = runBrick(params.duration, ctx);
		ctx.game.exportDiff(ctx)
		let pauseState = {
			id: ctx.log.length,
			state_type: 1,
			value: {
				delay: duration,
			}
		};
		ctx.log.push(pauseState)
	}
})

addBrickSig({
	type: 'action',
	func: 'event',
	name: 'Event',
	params: [
		{ code: 'event_name', name: 'Event name', type: SType.from('SString') }, 
	],
	run: (params, ctx) => {
		let tplId = ctx.object.tplId
		let cardType = ctx.game.content.get('cardTypes', tplId)
		let fieldName = `action_on_${params.event_name}`;
		if (cardType[fieldName]) {
			runBrick(cardType[fieldName], ctx)
		}
	}
})

addBrickSig({
	type: 'action',
	func: 'create_entity',
	name: 'CreateEntity',
	params: [
		{ code: 'card_type', name: 'Card type', type: SType.from('SBrick<value>') }, 
		{ code: 'place', name: 'Place', type: SType.from('SBrick<value>') }, 
		{ code: 'action', name: 'Action', type: SType.from('SBrick<action>') }, 
	],
	run: (params, ctx) => {
		let card_type	= runBrick(params.card_type, ctx)
		let place = runBrick(params.place, ctx)
		let newObj = ctx.game.createEntity(card_type)
		let oldObj = ctx.object
		ctx.object = newObj
		runBrick(params.action, ctx)
		ctx.object = oldObj
	}
})

addBrickSig({
	type: 'action',
	func: 'delete_entity',
	name: 'DeleteEntity',
	params: [],
	run: (params, ctx) => {
		ctx.obj.deleted = true;
	}
})


addBrickSig({
	type: 'action',
	func: 'console_log',
	name: 'Console log',
	params: [
		{ code: 'message', name: 'Message', type: SType.from('SString') },
	],
	run: (params, ctx) => {
		console.log('Brick Message: ' + params[1])
		console.log('VARS: ' + JSON.stringify(ctx.vars))
		console.log('ATTRS: ' + JSON.stringify(ctx.object.attrs))
		console.log('GAME ATTRS ' + JSON.stringify(ctx.game.attrs))
	}
})
