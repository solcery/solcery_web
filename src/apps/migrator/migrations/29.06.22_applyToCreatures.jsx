import { execute } from '../../content';
import moment from 'moment';

const applyToNonDisabled = 'custom.6292959419189affcfc0069a';
const applyToAll = 'custom.62b9ac4fe15013cbc1459bd2';
const newApply = 'custom.62bc47775d6c8123e730605a';

const customTrue = {
	lib: 'condition',
	func: 'custom.6292959419189affcfc006cb',
	params: {},
};

const customFalse = {
	lib: 'condition',
	func: 'custom.6292959419189affcfc006cc',
	params: {},
};

const migrateBrick = (bt) => {
	let changed = false;
	for (let param of Object.values(bt.params)) {
		if (param && param.lib) {
			changed = changed || migrateBrick(param);
		}
	}
	if (bt.func === applyToNonDisabled) {
		bt.func = newApply;
		bt.params['Affect Disabled'] = customFalse;
		changed = true;
	}
	if (bt.func === applyToAll) {
		bt.func = newApply;
		bt.params['Affect Disabled'] = customTrue;
		changed = true;
	}
	return changed;
};

export const migrator = (content) => {
	let objects = [];
	for (let object of content.objects) {
		for (let [field, value] of Object.entries(object.fields)) {
			if (!value) continue;
			if (value.brickTree) {
				if (migrateBrick(value.brickTree)) {
					objects.push(object);
				}
			}
		}
	}
	return { objects };
};
