const migrateBrick = (bt) => {
	let changed = false;
	if (bt.lib === 'action' && bt.func === 'play_sound') {
		bt.params.volume = {
			lib: 'value',
			func: 'const', 
			params: {
				value: 100,
			}
		}
		return true;
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
