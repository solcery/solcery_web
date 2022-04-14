import { SType } from '../../index'
import { addBrickSig, bricks } from '../index'
import { insertTable } from '../../../../utils';


// insertTable(bricks, [ 'action', 'void' ], {
// 	type: 'action',
// 	func: 'void',
// 	params: {},
// 	run: () => {}
// })

// console.log(b)

// export default {}

// console.log(addBrickSig)
// addBrickSig({
//   type: 'action',
//   func: 'void',
//   name: 'Void',
//   params: [],
//   run: () => {}
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

//addBricks({ action });

// basicBricks = [];

// basicBricks.push({
// 	type: 0,
// 	subtype: 0,
// 	name: 'Void',
// 	func: () => {},
// 	params: [],
// })

// // action.set
// basicBricks.push({
// 	type: 0,
// 	subtype: 1,
// 	name: 'Two actions',
// 	params: [
// 		{ id: 1, code: 'action1', name: 'Action #1', type: SType.from({ name: "SBrick", data: { brickType: "action" } }) },
// 		{ id: 1, code: 'action2', name: 'Action #2', type: SType.from({ name: "SBrick", data: { brickType: "action" } }) },
// 	],
// 	func: (params, ctx) => {
// 		applyBrick(params.action1, ctx)
// 		applyBrick(params.action2, ctx)
// 	}
// })

// // action.conditional
// basicBricks.push({
//	 type: 0,
//	 subtype: 2,
//	 name: 'If-Then-Else',
//	 params: [
//		 { id: 1, code: 'if', name: 'If', type: new SBrick({ brickType: 1 }) },
//		 { id: 2, code: 'then', name: 'Then', type: new SBrick({ brickType: 0 }) },
//		 { id: 3, code: 'else', name: 'Else', type: new SBrick({ brickType: 0 }) }
//	 ],
//	 func: (params, ctx) => {
//		 if (applyBrick(params.if, ctx)) {
//			 applyBrick(params.then, ctx)
//		 }
//		 else {
//			 applyBrick(params.else, ctx)
//		 }
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 3,
//	 name: 'Loop',
//	 params: [
//		 { id: 1, code: 'counter_var', name: 'Counter var', type: new SString() },
//		 { id: 2, code: 'iterations', name: 'Iterations', type: new SBrick({ brickType: 2 }) },
//		 { id: 3, code: 'action', name: 'Action', type: new SBrick({ brickType: 0 }) },
//	 ],
//	 func: (params, ctx) => {
//		 let iter = applyBrick(params.iterations, ctx)
//		 for (let i = 0; i < iter; i++) {
//			 ctx.vars[params.counter_var] = i; //TODO: cleanup
//			 applyBrick(params.action, ctx);
//		 }
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 4,
//	 name: 'Argument',
//	 params: [
//		 { id: 1, code: 'name', name: 'Name', type: new SString() },
//	 ],
//	 func: argFunc,
// })

// function shuffleArray(array) {
//	 for (var i = array.length - 1; i > 0; i--) {
//		 var j = Math.floor(Math.random() * (i + 1));
//		 var temp = array[i];
//		 array[i] = array[j];
//		 array[j] = temp;
//	 }
// }

// basicBricks.push({
//	 type: 0,
//	 subtype: 5,
//	 name: 'Iterator',
//	 params: [
//		 { id: 1, code: 'condition',name: 'Condition', type: new SBrick({ brickType: 1 }) },
//		 { id: 2, code: 'action',name: 'Action', type: new SBrick({ brickType: 0 }) },
//		 { id: 3, code: 'limit', name: 'Limit', type: new SBrick({ brickType: 2 }) }
//	 ],
//	 func: (params, ctx) => {
//		 let limit = applyBrick(params.limit, ctx)
//		 let objs = []
//		 let oldObj = ctx.object 
//		 let amount = 0
//		 let objects = [...ctx.game.objects.values()]
//		 shuffleArray(objects)
//		 while (limit > 0 && objects.length > 0) {
//			 ctx.object = objects.pop()
//			 if (applyBrick(params.condition, ctx)) {
//				 objs.push(ctx.object)
//				 limit--;
//			 }
//		 }
//		 for (let obj of objs) {
//			 ctx.object = obj
//			 applyBrick(params.action, ctx)
//		 }
//		 ctx.object = oldObj
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 6,
//	 name: 'Set variable',
//	 params: [
//		 { id: 1, code: 'var_name', name: 'Var', type: new SString() },
//		 { id: 2, code: 'value', name: 'Value', type: new SBrick({ brickType: 2 }) }
//	 ],
//	 func: (params, ctx) => {
//		 let varName = params.var_name
//		 let value = params.value
//		 ctx.vars[varName] = applyBrick(value, ctx)
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 7,
//	 name: 'Set attribute',
//	 params: [
//		 { id: 1, code: 'attr_name', name: 'Attr', type: new SString() },
//		 { id: 2, code: 'value', name: 'Value', type: new SBrick({ brickType: 2 }) }
//	 ],
//	 func: (params, ctx) => {
//		 let attrName = params.attr_name
//		 let value = applyBrick(params.value, ctx)
//		 if (ctx.object.attrs[attrName] === undefined)
//			 throw new Error("trying to set unknown attr " + attrName)
//		 ctx.object.attrs[attrName] = value
//		 if (ctx.diff) {
//			 let objectId = ctx.object.id
//			 if (!ctx.diff.objects[objectId]) {
//				 ctx.diff.objects[objectId] = {
//					 id: objectId,
//					 tplId: ctx.object.tplId,
//					 attrs: {}
//				 }
//			 }
//			 ctx.diff.objects[objectId].attrs[attrName] = value
//		 }
//	 }
// })


// basicBricks.push({
//	 type: 0,
//	 subtype: 8,
//	 name: 'Use card',
//	 params: [],
//	 func: (params, ctx) => {
//		 let tplId = ctx.object.tplId
//		 let cardType = ctx.game.content.get('cardTypes', tplId)
//		 if (cardType.action) {
//			 applyBrick(cardType.action, ctx)
//		 }
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 9,
//	 name: 'Set game attribute',
//	 params: [
//		 { id: 1, code: 'attr_name', name: 'Attr', type: new SString() },
//		 { id: 2, code: 'value', name: 'Value', type: new SBrick({ brickType: 2 }) }
//	 ],
//	 func: (params, ctx) => {
//		 let attrName = params.attr_name
//		 let value = applyBrick(params.value, ctx)
//		 if (ctx.game.attrs[attrName] === undefined)
//			 throw new Error("Trying to set unknown game attr " + attrName)
//		 ctx.game.attrs[attrName] = value
//		 if (ctx.diff) {
//			 ctx.diff.attrs[attrName] = value
//		 }
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 10,
//	 name: 'Pause',
//	 params: [
//		 { id: 1, code: 'duration', name: 'Duration', type: new SBrick({ brickType: 2 }) }, 
//	 ],
//	 func: (params, ctx) => {
//		 let duration = applyBrick(params.duration, ctx);
//		 ctx.game.exportDiff(ctx)
//		 let pauseState = {
//			 id: ctx.log.length,
//			 state_type: 1,
//			 value: {
//				 delay: duration,
//			 }
//		 };
//		 ctx.log.push(pauseState)
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 11,
//	 name: 'Event',
//	 params: [
//		 { id: 1, code: 'event_name', name: 'Event name', type: new SString() }, 
//	 ],
//	 func: (params, ctx) => {
//		 let tplId = ctx.object.tplId
//		 let cardType = ctx.game.content.get('cardTypes', tplId)
//		 let fieldName = `action_on_${params.event_name}`;
//		 if (cardType[fieldName]) {
//			 applyBrick(cardType[fieldName], ctx)
//		 }
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 12,
//	 name: 'CreateEntity',
//	 params: [
//		 { id: 1, code: 'card_type', name: 'Card type', type: new SBrick({ brickType: 2 }) }, 
//		 { id: 2, code: 'place', name: 'Place', type: new SBrick({ brickType: 2 }) }, 
//		 { id: 3, code: 'action', name: 'Action', type: new SBrick({ brickType: 0 }) }, 
//	 ],
//	 func: (params, ctx) => {
//		 let card_type	= applyBrick(params.card_type, ctx)
//		 let place = applyBrick(params.place, ctx)
//		 let newObj = ctx.game.createEntity(card_type)
//		 let oldObj = ctx.object
//		 ctx.object = newObj
//		 applyBrick(params.action, ctx)
//		 ctx.object = oldObj
//	 }
// })

// basicBricks.push({
//	 type: 0,
//	 subtype: 13,
//	 name: 'DeleteEntity',
//	 params: [],
//	 func: (params, ctx) => {
//		 ctx.obj.deleted = true;
//	 }
// })


// basicBricks.push({
//	 type: 0,
//	 subtype: 256,
//	 name: 'Console log',
//	 params: [
//		 { id: 1, code: 'message', name: 'Message', type: new SString() },
//	 ],
//	 func: (params, ctx) => {
//		 console.log('Brick Message: ' + params[1])
//		 console.log('VARS: ' + JSON.stringify(ctx.vars))
//		 console.log('ATTRS: ' + JSON.stringify(ctx.object.attrs))
//		 console.log('GAME ATTRS ' + JSON.stringify(ctx.game.attrs))
//	 }
// })
