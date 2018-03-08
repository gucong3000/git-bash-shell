'use strict';
function pathUnique (arr) {
	var result = [];
	var hash = {};
	arr.forEach(function (elem) {
		if (!elem) {
			return;
		}
		var key = elem.toLowerCase();
		if (hash[key]) {
			return;
		}
		result.push(elem);
		hash[key] = true;
	});
	return result;
}

module.exports = pathUnique;
