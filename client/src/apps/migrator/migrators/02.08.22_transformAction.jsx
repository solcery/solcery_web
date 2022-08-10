const migrateBrick = (bt) => {
	if (!bt) return false;
	let changed = false;
	if (bt.lib === 'action' && bt.func === 'transform') {
		let tplIdLink = bt.params.tpl_id;
		if (typeof tplIdLink === 'string') {
			bt.params.tpl_id = {
				lib: 'value',
				func: 'cardType',
				params: {
					value: tplIdLink
				}
			}
			return true;
		}
	}
	for (let param of Object.values(bt.params)) {
		if (param && param.lib) {
			if (migrateBrick(param)) changed = true;
		}
	}
	return changed;
};

export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (!value) continue;
			if (value.brickTree) {
				if (migrateBrick(value.brickTree)) changed = true;
			}
		}
		if (changed) objects.push(object);
	}
	return { objects };
};
