import { execute } from '../../content';

const migrateFields = (object, meta) => {
	if (object.template === 'cardTypes') {
		if (object.fields.action) {
			object.fields.action_on_left_click = object.fields.action;
			object.fields.action = undefined;
			meta.objects.push(object);
		}
	}
	if (object.template === 'places') {
		if (object.fields.layout === 7) {
			object.fields.layout = 8;
			meta.objects.push(object);
		}
	}
};

export const migrator = (content) => {
	let meta = {
		content,
		objects: [],
	};
	execute(migrateFields, meta);
	return meta.objects;
};
