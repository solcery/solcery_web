import { basicActions } from '../../content/brickLib/action';
import { basicValues } from '../../content/brickLib/value';
import { basicConditions } from '../../content/brickLib/condition';

let bricksByTypeSubtype = {
	0: Object.fromEntries(basicActions.map((brick) => [brick.subtype, brick])),
	1: Object.fromEntries(basicConditions.map((brick) => [brick.subtype, brick])),
	2: Object.fromEntries(basicValues.map((brick) => [brick.subtype, brick])),
};

const brickByTypeSubtype = (type, subtype) => {
	if (subtype > 10000) {
		return [brickLibByType(type), `custom.[-${subtype - 10000}-]`];
	}
	let brick = bricksByTypeSubtype[type][subtype];
	return [brick.lib, brick.func];
};

const brickLibByType = (type) => {
	if (type === 0) return 'action';
	if (type === 1) return 'condition';
	if (type === 2) return 'value';
};

const handleBrick = (brick, args, content) => {
	let [lib, func] = brickByTypeSubtype(brick.type, brick.subtype);
	let params = {};
	for (let param of brick.params) {
		if (typeof param.value === 'object') {
			params[param.name] = handleBrick(param.value, args, content);
		} else {
			params[param.name] = param.value;
		}
	}
	if (func === 'arg') {
		let nameParam = brick.params[0];
		if (nameParam.name !== 'name') {
			throw Error('ERROR');
		}
		args[nameParam.value] = lib;
	}
	if (lib === 'value' && func === 'const') {
		let val = params.value;
		let cardTypes = content.cardTypes.objects;
		let cardType = cardTypes.find((cardType) => cardType.id === val);
		if (cardType) {
			func = 'cardType';
			params.value = `[-${cardType.id}-]`;
		}
	}
	return { lib, func, params };
};

export const constructedBrickToBrick = function (brick, content) {
	let args = {};
	let brickTree = handleBrick(brick, args, content);
	let brickParams = Object.entries(args).map(([name, lib]) => {
		return {
			key: name,
			value: lib,
		};
	});
	return {
		brickType: brickLibByType(brick.type),
		brickParams,
		brickTree,
	};
};
