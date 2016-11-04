//handlebars helper
//css helper
exports.css = function(str, option) {
	var cssList = this.cssList || [];
	console.log('--',cssList);
	str = str.split(/[,，;；]/);
	console.log('css: ', str);
	str.forEach(function(item) {
		if (cssList.indexOf(item) < 0) {
			cssList.push(item);
		}
	});
	this.cssList = cssList.concat();
};

//js helper
exports.js = function(str, option) {
	var jsList = this.jsList || [];
	str = str.split(/[,，;；]/);
	console.log('js: ', str);
	str.forEach(function(item) {
		if (jsList.indexOf(item) < 0) {
			jsList.push(item);
		}
	});
	this.jsList = jsList.concat();
	console.log(jsList);
};