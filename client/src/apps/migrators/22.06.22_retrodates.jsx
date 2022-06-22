import { execute } from '../../content';
import moment from 'moment';

const templates = [
	{
		code: 'cardTypes',
		field: 'name',
	},
	{
		code: 'places',
		field: 'placeId',
	},
	{
		code: 'cards',
		field: 'name'
	},
	{
		code: 'attributes',
		field: 'code',
	},
	{
		code: 'customBricks',
		field: 'name',
	}
]

export const migrator = (content, oldContent) => {
	let objects = [];
	for (let template of templates) {
		let startingMoment = moment("20211201", "YYYYMMDD");
		let oldObjects = oldContent.objects.filter(obj => obj.template === template.code)
		let newObjects = content.objects.filter(obj => obj.template === template.code)
		for (let oldObject of oldObjects) {
			let newObj = newObjects.find(obj => obj.fields[template.field] !== undefined && obj.fields[template.field] === oldObject.fields[template.field])
			if (newObj) {
				newObj.fields.creationTime = startingMoment.add(1, 'hours').format();
				objects.push(newObj)
			}
		}
		startingMoment = moment("20220201", "YYYYMMDD");
		for (let newObject of newObjects) {
			if (!newObject.fields.creationTime) {
				newObject.fields.creationTime = startingMoment.add(1, 'hours').format();
				objects.push(newObject)
			}
		}
	}
	return { objects };
};
