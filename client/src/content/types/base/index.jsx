const _stypebyclassname = {}

export const SType = {
	register: (classname, constructor) => {
		_stypebyclassname[classname] = constructor;
	},

	from: (src) => {
		let classfunc = _stypebyclassname[src.name];
		if (!classfunc)
			throw new Error('Error building stype from data!');
		return new classfunc(src.data);
	}
}
