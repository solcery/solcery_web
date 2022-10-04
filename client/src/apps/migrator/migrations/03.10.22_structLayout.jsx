import { ObjectId } from 'mongodb';

export const migrator = (content) => {
	let objects = [];
	let layouts = {};

	const addLayout = (object) => {
		let { cardType, place, amount, preset, enabled } = object.fields;
		let key = `${preset}_${place}_${enabled}`;
		if (!layouts[key]) {

			let placeTpl = content.objects.find(obj => obj._id === place);
			let placeName = placeTpl.fields.name;

			layouts[key] = {
				_id: ObjectId().toString(),
				template: 'cards',
				fields: {
					name: `[${preset}] ${placeName} ${enabled}`,
					creationTime: Math.floor(Date.now() / 1000),
					enabled,
					place,
					preset,
					cards: []
				}
			}
		}
		layouts[key].fields.cards.push({
			cardType,
			amount
		});
	}

	for (let object of content.objects.filter(obj => obj.template === 'cards')) {
		addLayout(object);
		object.fields.enabled = false;
		objects.push(object)
	}
	return { objects, newObjects: Object.values(layouts) };
};
