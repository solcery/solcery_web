const _stypebyclassname = {}

const _buildstype = (name, data = {}) => {
	let classConstructor = _stypebyclassname[name];
	if (!classConstructor) throw new Error('Error building stype from data!');
	return new classConstructor(data)
}

export const SType = {
	register: (classname, constructor) => {
		_stypebyclassname[classname] = constructor;
	},


	// TODO: fromJSON
	
	from: (src) => {
		switch (typeof src) {
			case 'string':
				return _buildstype(src, {});
				break;
			case 'object':
				return _buildstype(src.name, src.data);
			default:
				throw new Error("Unknown type definition from mongo")
		}
	}
}
