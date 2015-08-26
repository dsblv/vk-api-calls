var stream = require('stream');
var util = require('util');

module.exports = CollectStream;

util.inherits(CollectStream, stream.Readable);

function CollectStream(supplier, method, query) {
	stream.Readable.call(this, {objectMode: true});

	query = query || {};
	query['offset'] = query['offset'] || 0;

	this._count = 0;

	var _this = this;

	this._fetch = function () {
		supplier.apiCall(method, query, function (err, data) {
			if (err || data.error) {
				_this.emit('error', err || data.error);
				return;
			}

			data = data.response;

			if (!data.items || data.items.length === 0) {
				_this.push(null);
				return;
			}

			_this._count += data.items.length;

			_this.push(data);

			var condition = Boolean(query['count']) ? (_this._count < query['count']) : (_this._count < data.count);

			if (condition) {
				query['offset'] += data.items.length;

				if (query['count'] && (query['count'] < query['offset'] + data.items.length)) {
					query['count'] -= query['offset'];
				}
			} else {
				_this.push(null);
			}
		});
	};
}

CollectStream.prototype._read = function () {
	this._fetch();
};
