const unityCodes = {
	action: {},
	condition: {},
	value: {},
	jsonToken: {},
	jsonKeyPair: {},
}

unityCodes.action._type = 0;
unityCodes.action.void = 0;
unityCodes.action.two = 1;
unityCodes.action.if_then = 2;
unityCodes.action.loop = 3;
unityCodes.action.arg = 4;
unityCodes.action.iter = 5;
unityCodes.action.set_var = 6;
unityCodes.action.set_attr = 7;
unityCodes.action.use_card = 8;
unityCodes.action.set_game_attr = 9;
unityCodes.action.pause = 10;
unityCodes.action.event = 11;
unityCodes.action.create_entity = 12;
unityCodes.action.delete_entity = 13;
unityCodes.action.clear_attrs = 14;
unityCodes.action.start_timer = 15;
unityCodes.action.stop_timer = 16;
unityCodes.action.transform = 17;
unityCodes.action.play_sound = 18;
unityCodes.action.set_scope_var = 19;
unityCodes.action.console_log = 0;
unityCodes.action.command = 0;
unityCodes.action.push_action = 20;
unityCodes.action.push_action_json = 21;
unityCodes.action.link = 22;


unityCodes.condition._type = 1;
unityCodes.condition.const = 0;
unityCodes.condition.not = 1;
unityCodes.condition.eq = 2;
unityCodes.condition.gt = 3;
unityCodes.condition.lt = 4;
unityCodes.condition.arg = 5;
unityCodes.condition.or = 6;
unityCodes.condition.and = 7;
unityCodes.condition.iter_or = 8;
unityCodes.condition.iter_and = 9;
unityCodes.condition.link = 10;


unityCodes.value._type = 2;
unityCodes.value.const = 0;
unityCodes.value.place = 0;
unityCodes.value.cardType = 0;
unityCodes.value.var = 1;
unityCodes.value.attr = 2;
unityCodes.value.arg = 3;
unityCodes.value.if_then = 4;
unityCodes.value.add = 5;
unityCodes.value.sub = 6;
unityCodes.value.mul = 7;
unityCodes.value.div = 8;
unityCodes.value.mod = 9;
unityCodes.value.random = 10;
unityCodes.value.entity_id = 11;
unityCodes.value.tpl_id = 12;
unityCodes.value.game_attr = 13;
unityCodes.value.iter_sum = 14;
unityCodes.value.set_var = 15;
unityCodes.value.iter_max = 16;
unityCodes.value.iter_min = 17;
unityCodes.value.scope_var = 18;
unityCodes.value.set_scope_var = 19;
unityCodes.value.time = 11;
unityCodes.value.animation_id = 0;
unityCodes.value.link = 20;


unityCodes.jsonKeyPair._type = 4;
unityCodes.jsonKeyPair.base = 0;
unityCodes.jsonKeyPair.arg = 1;
unityCodes.jsonKeyPair.link = 2;

unityCodes.jsonToken._type = 5;
unityCodes.jsonToken.int = 0;
unityCodes.jsonToken.string = 1;
unityCodes.jsonToken.object = 2;
unityCodes.jsonToken.array = 3;
unityCodes.jsonToken.arg = 4;
unityCodes.jsonKeyPair.link = 5;

module.exports = unityCodes;