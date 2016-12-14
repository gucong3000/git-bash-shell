var fs = require('fs');

function isFileSync(file) {
	var stats;
	try {
		stats = fs.statSync(file);
	} catch(ex) {
		//
	}
	return stats && stats.isFile();
}

// 搜索数组中第一个真实存在的可执行文件的全路径
function findFile(pathList) {
	var result;
	var pathExtExe = process.env.PATHEXT || '.EXE;.CMD;.BAT;.COM';
	var pathExt = pathExtExe.split(';');
	pathExt.push('');
	pathList.some(function(file) {
		if(/\.\w+$/.test(file)) {
			if(isFileSync(file)) {
				result = file;
			}
		} else {
			pathExt.some(function(ext) {
				var fullPath = file + ext;
				if(isFileSync(fullPath)) {
					result = fullPath;
				}
				return result;
			});
		}
		return result;
	});
	return result;
}

module.exports = findFile;
