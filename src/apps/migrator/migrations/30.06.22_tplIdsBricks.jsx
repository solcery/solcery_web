import { execute } from '../../content';
import moment from 'moment';

const cardTypeTplBrickGroupId = '62b25dec3be00cf7d6a930c0';
const placeIdBrickGroupId = '62b25de371cafe482c936633';

// Все вызовы бриков из группы CardTypeTplIds поменять на содержимое соответствующих кастомных бриков.
// Отключить все кастомные брики из группы CardTypeTplIds брики. Дописать [ DELETE ] в их название

// Добавить новый кирпич value.place, с аргументом Link<place.placeId>

// Для каждого кастомбрика из группы PlaceIds сделать следующее:
// Убедиться что брик состоит из одного value.const. Далее - найти и промапить плейс с placeId, равным данной константе.

// Все вызовы из бриков группы PlaceIds - поменять на кирпич value.place с аргументом с промапленным плейсом

// Все кастомные брики из группы PlaceIds - отключить и дописать в их название [ DELETE ].

const migrateBrick = (bt, migrationList) => {
	let changed = false;
	if (migrationList[bt.func]) {
		let newBrick = migrationList[bt.func];
		bt.func = newBrick.func;
		bt.params = Object.assign({}, newBrick.params);
		return true;
	} else {
		for (let param of Object.values(bt.params)) {
			if (param && param.lib) {
				if (migrateBrick(param, migrationList)) changed = true;
			}
		}
	}
	return changed;
};

export const migrator = (content) => {
	let objects = [];
	let migrationList = {};

	let placeIdCustomBricks = content.objects.filter(
		(obj) => obj.template === 'customBricks' && obj.fields.brick_group === placeIdBrickGroupId
	);
	for (let placeIdCustomBrick of placeIdCustomBricks) {
		let customBrickFunc = `custom.${placeIdCustomBrick._id}`;
		let placeId = placeIdCustomBrick.fields.brick.brickTree.params.value;
		let placeObj = content.objects.find((obj) => obj.template === 'places' && obj.fields.placeId === placeId);
		if (placeObj === undefined) throw new Error('Err');
		migrationList[customBrickFunc] = {
			lib: 'value',
			func: 'place',
			params: {
				value: placeObj._id,
			},
		};
	}

	let cardTypeTplCustomBricks = content.objects.filter(
		(obj) => obj.template === 'customBricks' && obj.fields.brick_group === cardTypeTplBrickGroupId
	);
	for (let cardTypeTplCustomBrick of cardTypeTplCustomBricks) {
		let customBrickFunc = `custom.${cardTypeTplCustomBrick._id}`;
		let cardTypeTplCall = cardTypeTplCustomBrick.fields.brick.brickTree;
		migrationList[customBrickFunc] = cardTypeTplCall;
	}

	for (let object of content.objects) {
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (!value) continue;
			if (value.brickTree) {
				if (migrateBrick(value.brickTree, migrationList)) {
					changed = true;
				}
			}
		}
		if (changed) objects.push(object);
	}
	for (let object of content.objects.filter(
		(obj) => obj.template === 'customBricks' && migrationList[`custom.${obj._id}`]
	)) {
		object.fields.enabled = false;
		object.fields.name = object.fields.name + ` [ DELETED ]`;
		objects.push(object);
	}

	return { objects };
};
