import { execute } from '../../content';
import moment from 'moment';

export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		if (object.fields.creationTime) {
			object.fields.creationTime = moment(object.fields.creationTime).unix();
			objects.push(object);
		}
	}
	return { objects };
};
