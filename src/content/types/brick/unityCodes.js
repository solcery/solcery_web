const unityCodes = {
	action: {},
	condition: {},
	value: {},
	jsonToken: {},
	jsonKeyPair: {},
}

unityCodes.action.void = { type: 0, subtype: 0 };
unityCodes.action.two = { type: 0, subtype: 1 };
unityCodes.action.if_then = { type: 0, subtype: 2 };
unityCodes.action.loop = { type: 0, subtype: 3 };
unityCodes.action.arg = { type: 0, subtype: 4 };
unityCodes.action.iter = { type: 0, subtype: 5 };
unityCodes.action.set_var = { type: 0, subtype: 6 };
unityCodes.action.set_attr = { type: 0, subtype: 7 };
unityCodes.action.use_card = { type: 0, subtype: 8 };
unityCodes.action.set_game_attr = { type: 0, subtype: 9 };
unityCodes.action.pause = { type: 0, subtype: 10 };
unityCodes.action.event = { type: 0, subtype: 11 };
unityCodes.action.create_entity = { type: 0, subtype: 12 };
unityCodes.action.delete_entity = { type: 0, subtype: 13 };
unityCodes.action.clear_attrs = { type: 0, subtype: 14 };
unityCodes.action.start_timer = { type: 0, subtype: 15 };
unityCodes.action.stop_timer = { type: 0, subtype: 16 };
unityCodes.action.transform = { type: 0, subtype: 17 };
unityCodes.action.play_sound = { type: 0, subtype: 18 };
unityCodes.action.set_scope_var = { type: 0, subtype: 19 };
unityCodes.action.console_log = { type: 0, subtype: 0 };
unityCodes.action.command = { type: 0, subtype: 0 };
unityCodes.action.push_action = { type: 0, subtype: 20 };
unityCodes.action.push_action_json = { type: 0, subtype: 21 };



unityCodes.condition.const = { type: 1, subtype: 0 };
unityCodes.condition.not = { type: 1, subtype: 1 };
unityCodes.condition.eq = { type: 1, subtype: 2 };
unityCodes.condition.gt = { type: 1, subtype: 3 };
unityCodes.condition.lt = { type: 1, subtype: 4 };
unityCodes.condition.arg = { type: 1, subtype: 5 };
unityCodes.condition.or = { type: 1, subtype: 6 };
unityCodes.condition.and = { type: 1, subtype: 7 };
unityCodes.condition.iter_or = { type: 1, subtype: 8 };
unityCodes.condition.iter_and = { type: 1, subtype: 9 };


unityCodes.value.const = { type: 2, subtype: 0 };
unityCodes.value.place = { type: 2, subtype: 0 };
unityCodes.value.cardType = { type: 2, subtype: 0 };
unityCodes.value.var = { type: 2, subtype: 1 };
unityCodes.value.attr = { type: 2, subtype: 2 };
unityCodes.value.arg = { type: 2, subtype: 3 };
unityCodes.value.if_then = { type: 2, subtype: 4 };
unityCodes.value.add = { type: 2, subtype: 5 };
unityCodes.value.sub = { type: 2, subtype: 6 };
unityCodes.value.mul = { type: 2, subtype: 7 };
unityCodes.value.div = { type: 2, subtype: 8 };
unityCodes.value.mod = { type: 2, subtype: 9 };
unityCodes.value.random = { type: 2, subtype: 10 };
unityCodes.value.entity_id = { type: 2, subtype: 11 };
unityCodes.value.tpl_id = { type: 2, subtype: 12 };
unityCodes.value.game_attr = { type: 2, subtype: 13 };
unityCodes.value.iter_sum = { type: 2, subtype: 14 };
unityCodes.value.set_var = { type: 2, subtype: 15 };
unityCodes.value.iter_max = { type: 2, subtype: 16 };
unityCodes.value.iter_min = { type: 2, subtype: 17 };
unityCodes.value.scope_var = { type: 2, subtype: 18 };
unityCodes.value.set_scope_var = { type: 2, subtype: 19 };
unityCodes.value.time = { type: 2, subtype: 11 };
unityCodes.value.animation_id = { type: 2, subtype: 0 };
unityCodes.value.sound_id = { type: 2, subtype: 0 };


unityCodes.jsonKeyPair.base = { type: 4, subtype: 0 };
unityCodes.jsonKeyPair.arg = { type: 4, subtype: 1 };

unityCodes.jsonToken.int = { type: 5, subtype: 0 };
unityCodes.jsonToken.string = { type: 5, subtype: 1 };
unityCodes.jsonToken.object = { type: 5, subtype: 2 };
unityCodes.jsonToken.array = { type: 5, subtype: 3 };
unityCodes.jsonToken.arg = { type: 5, subtype: 4 };

module.exports = unityCodes;