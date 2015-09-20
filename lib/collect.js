'use strict';

var deepAssign = require('deep-assign');
var CollectStream = require('./collect-stream');

module.exports = function (method, query) {
	var stream = new CollectStream(this, method, query);

	var promise = new Promise(function (resolve, reject) {
		var stored = {
			items: []
		};

		stream
		.on('data', function (data) {
			var d = deepAssign({}, data);
			d.items = stored.items.concat(d.items);
			stored = deepAssign(stored, d);
		})
		.on('error', function (err) {
			reject(err);
		})
		.on('end', function () {
			resolve(stored);
		});
	});

	promise.stream = stream;

	return promise;
};
