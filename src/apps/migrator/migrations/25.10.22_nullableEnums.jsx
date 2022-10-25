import { ObjectId } from 'mongodb';

export const migrator = (content) => {
	let objects = [];

	for (let template of content.templates) {
		let templateObjects = content.objects.filter(obj => obj.template === template.code);
		for (let object of templateObjects) {
			if (object.template === 'places') {
				object.fields.layout = object.fields.layout ?? 0;
				if (object.fields.layout <= 5) {
					object.fields.face = null;
				} else {
					object.fields.face = object.fields.face ?? 0;
				}
				if (object.fields.caption) {
					object.fields.caption_position = object.fields.caption_position ?? 0;
				} else {
					object.fields.caption_position = null;
				}
				if (object.fields.layout === 5) {
					object.fields.picture_fit_type = object.fields.picture_fit_type ?? 0;
				} else {
					object.fields.picture_fit_type = null;
				}
				objects.push(object);
			}
			if (object.template === 'drag_n_drops') {
				object.fields.layout = object.fields.layout ?? 0;
				object.fields.required_card_types = null;
				object.fields.destination_condition = null;
				objects.push(object);
			}
			if (object.template === 'cardTypes') {
				object.fields.type = object.fields.type ?? 0;
				object.fields.destination_condition = null;
				objects.push(object);
			}
		}
	}
	return { objects };
};
