export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		let creationTimeLength = object.fields.creationTime.toString().length;
		if (creationTimeLength > 10) {
			objects.push(object);
			object.fields.creationTime = Math.floor(object.fields.creationTime / 1000);
		}
	}
	return { objects };
};
