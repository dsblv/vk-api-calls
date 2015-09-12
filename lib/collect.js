var objectAssign = require('object-assign');
var CollectStream = require('./collect-stream');

module.exports = function (method, query, callback) {
	var stream = new CollectStream(this, method, query);

	var promise = new Promise(function (resolve, reject) {
		var stored = {
			items: []
		};

		stream
		.on('data', function (data) {
			var d = objectAssign({}, data);
			d.items = stored.items.concat(d.items);
			stored = objectAssign(stored, d);
		})
		.on('error', function (err) {
			reject(err);
			if (typeof callback === 'function') {
				callback(err, null);
			}
		})
		.on('end', function () {
			resolve(stored);
			if (typeof callback === 'function') {
				callback(null, stored);
			}
		});
	});

	promise.stream = stream;

	return (typeof callback === 'function') ? this : promise;
};
