var stream = require('stream');
var util = require('util');

module.exports = CollectStream;

util.inherits(CollectStream, stream.Readable);

function CollectStream(supplier, method, query) {
	stream.Readable.call(this, {objectMode: true});

	query = query || {};
	query['offset'] = query['offset'] || 0;

	this._count = 0;
	this.eof = false;

	var _this = this;

	this._fetch = function () {
		supplier.apiCall(method, query, function (err, data) {
			if (err || data.error) {
				if (err && err.code === 'ETIMEDOUT') {
					console.log('timedout error');

					_this._fetch();
				} else if (data && data.error && data.error['error_code']) {
					console.log(data.error);

					_this._fetch();
				} else {
					_this.emit('error', err || data.error);
				}
				return;
			}

			data = data.response;

			if (_this.eof) {
				_this.push(null);
				return;
			}

			_this.push(data);

			_this._count += data.items.length;

			console.log('count === ' + _this._count);

			var condition = Boolean(query['count']) ? (_this._count < query['count']) : (_this._count < data.count);

			if (condition) {
				query['offset'] += data.items.length;

				if (query['count'] && (query['count'] < query['offset'] + data.items.length)) {
					query['count'] -= query['offset'];
				}
			} else {
				_this.eof = true;
			}
		});
	};
}

CollectStream.prototype._read = function () {
	this._fetch();
};
