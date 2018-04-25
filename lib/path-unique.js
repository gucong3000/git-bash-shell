"use strict";
function pathUnique (arr) {
	const result = [];
	const hash = {};
	arr.forEach((elem) => {
		if (!elem) {
			return;
		}
		const key = elem.toLowerCase();
		if (hash[key]) {
			return;
		}
		result.push(elem);
		hash[key] = true;
	});
	return result;
}

module.exports = pathUnique;
