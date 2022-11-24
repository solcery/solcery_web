window.assert = function (expr, message) {
	if (!expr) {
		throw new Error(message);
	}
}

window.objget = (obj, ...path) => {
	assert(obj)
	return path.reduce((acc, pathElement, idx) => {
		if (!acc) return undefined;
		if (!acc[pathElement]) return undefined;
		return acc[pathElement];
	}, obj);
}

