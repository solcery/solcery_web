const migrateBrick = (bt) => {
	let changed = false;
	if (bt.lib === 'action' && bt.func === 'two') {
		let pauseBrick = bt.params.action1;
		let soundBrick = bt.params.action2;
		if (pauseBrick.func === 'pause' && pauseBrick.params.duration.params.value === 0 && soundBrick.func === 'play_sound') {
			bt.func = 'play_sound';
			bt.params = soundBrick.params;
			return true
		}
		if (pauseBrick.func === 'custom.6292959419189affcfc006b4' && pauseBrick.params['Pause time'].params.value === 0 && soundBrick.func === 'play_sound') {
			bt.func = 'play_sound';
			bt.params = soundBrick.params;
			return true
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
			if (object._id === '6315ee53b3e5e5398572d032') {
				console.log(value)
			}
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
