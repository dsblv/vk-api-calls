var stream = require('stream');
var util = require('util');

module.exports = CollectStream;

util.inherits(CollectStream, stream.Readable);

function CollectStream(supplier, method, query) {
	stream.Readable.call(this, {objectMode: true});

	var limit = (method.split('.')[0] === 'execute') ? 25000 : 1000;

	query = query || {};
	query.offset = query.offset || 0;

	this._expect = query.count;
	query.count = (query.count < limit) ? query.count : limit;

	this._arrived = 0;
	this.eof = false;

	var _this = this;

	this._fetch = function () {
		supplier.apiCall(method, query).then(function (res) {
			var data = res.body.response;

			if (_this.eof) {
				_this.push(null);
				return;
			}

			_this.push(data);

			var collected = data.items.length;

			if (_this._expect > data.count) {
				_this._expect = data.count;
			}

			_this._arrived += collected;

			var condition = Boolean(_this._expect) ? (_this._arrived < _this._expect) : (_this._arrived < data.count);

			if (condition) {
				query.offset += collected;

				if (_this._expect && (_this._expect - collected < query.count)) {
					query.count = _this._expect - collected;
				}
			} else {
				_this.eof = true;
			}
		}).catch(function (err) {
			if (err.code === 'ETIMEDOUT') {
				_this.emit('problem', err);
				_this._fetch();
			} else {
				_this.emit('error', err);
			}
			return err;
		});
	};
}

CollectStream.prototype._read = function () {
	this._fetch();
};
