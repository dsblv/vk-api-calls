var stream = require('stream');
var util = require('util');

module.exports = CollectStream;

util.inherits(CollectStream, stream.Readable);

function CollectStream(supplier, method, query) {
	stream.Readable.call(this, {objectMode: true});

	query = query || {};
	query['offset'] = query['offset'] || 0;

	this._expect = query['count'];
	query['count'] = (query['count'] < 1000) ? query['count'] : 1000;

	this._arrived = 0;
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

			_this._arrived += data.items.length;

			var condition = Boolean(_this._expect) ? (_this._arrived < _this._expect) : (_this._arrived < data.count);

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
