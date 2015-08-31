var stream = require('stream');
var util = require('util');
var config = require('../config');

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

					setTimeout(function () {
						_this._fetch();
					}, config.afterError);
				} else if (data.error && data.error['error_code']) {
					console.log('too many error');

					setTimeout(function () {
						_this._fetch();
					}, config.afterError);
				} else {
					_this.emit('error', err || data.error);
				}
				return;
			}

			data = data.response;

			if (_this.eof || !data.items || data.items.length === 0) {
				_this.eof = true;
				_this.push(null);
				return;
			}

			_this.push(data);

			_this._count += data.items.length;

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
