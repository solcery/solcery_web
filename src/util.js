window.assert = function (expr, message) {
	if (!expr) {
		throw new Error(message);
	}
}
