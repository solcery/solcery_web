export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (value === null) {
				changed = true;
				delete(object.fields[field]);
			}
		}
		if (changed) objects.push(object);
	}
	return { objects };
};
