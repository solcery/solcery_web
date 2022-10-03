const migrateBrick = (bt) => {
	let changed = false;
	if (bt.lib === 'action' && bt.func === 'two') {
		let action1 = bt.params.action1;
		let action2 = bt.params.action2;
		if (action1.func === 'void') {
			bt.func = action2.func;
			bt.params = action2.params;
			changed = true;
		}
		if (action2.func === 'void') {
			bt.func = action1.func;
			bt.params = action1.params;
			changed = true;
		}
		
	}
	if (bt.lib === 'action' && bt.func === 'if_then') {
		if (bt.params.else.func === 'void') {
			bt.func = 'custom.6305d1e81aa9e92b91bb50a5'
			bt.params = {
				Condition: bt.params.if,
				Action: bt.params.then,
			}
			changed = true;
		}
	}
	for (let param of Object.values(bt.params)) {
		if (param && param.lib) {
			if (migrateBrick(param)) {
				changed = true
			}
		}
	}
	return changed;
};

export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (value && value.brickTree) {
				if (migrateBrick(value.brickTree)) {
					changed = true;
				}
			}
		}
		if (changed) objects.push(object);
	}
	return { objects };
};
