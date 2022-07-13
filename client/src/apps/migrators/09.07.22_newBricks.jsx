export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		if (object.template !== 'customBricks') {
			for (let [ field, value ] of Object.entries(object.fields)) {
				if (value && value.brickType) {
					object.fields[field] = value.brickTree;
					objects.push(object);
				}
			}
		}
	}
	return { objects };
};
