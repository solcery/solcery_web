const migrateBrick = (bt, { attrs, gameAttrs }) => {
	let changed = false;
	if (bt.func === 'set_attr' || bt.func === 'attr') {
		let attrCode = bt.params.attr_name
		let attrId = attrs.find(contentAttr => contentAttr.fields.code === attrCode)._id;
		bt.params.attr_name = attrId 
		changed = true;
	} else if (bt.func === 'set_game_attr' || bt.func === 'game_attr') {
		let attrCode = bt.params.attr_name
		let attrId = gameAttrs.find(contentAttr => contentAttr.fields.code === attrCode)._id;
		bt.params.attr_name = attrId 
		changed = true;
	} 
	for (let param of Object.values(bt.params)) {
		if (param && param.lib) {
			if (migrateBrick(param, { attrs, gameAttrs })) {
				changed = true
			}
		}
	}
	return changed;
};

export const migrator = (content) => {
	let objects = [];

	let attrs = content.objects.filter(obj => obj.template === 'attributes');
	let gameAttrs = content.objects.filter(obj => obj.template === 'gameAttributes');
	
	for (let object of content.objects) {
		let changed = false;
		for (let [field, value] of Object.entries(object.fields)) {
			if (!value) continue;
			if (value.brickTree) {
				if (migrateBrick(value.brickTree, { attrs, gameAttrs })) {
					changed = true;
				}
			}
		}
		if (changed) objects.push(object);
	}
	return { objects };
};
