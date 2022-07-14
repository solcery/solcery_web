export const migrator = (content) => {
	let objects = [];

	let places = content.objects.filter(obj => obj.template === 'places');
	for (let object of content.objects.filter(obj => obj.template === 'cards')) {
		if (object.fields.place) {
			let placeItem = places.find(obj => obj.fields.placeId === object.fields.place);
			if (placeItem) {
				object.fields.place = placeItem._id;
				objects.push(object);
			}
			
		}
	}
	return { objects };
};
