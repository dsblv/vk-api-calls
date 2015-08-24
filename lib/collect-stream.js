var stream    = require('stream'),
    util      = require('util');


module.exports = CollectStream;


util.inherits(CollectStream, stream.Readable);


function CollectStream (supplier, method, query) {

  query = query || {};

  query['offset'] = query['offset'] || 0;

  stream.Readable.call(this, {
    objectMode: true
  });

  this._count = 0;

  var _this    = this,
      delay    = 333,
      lastCall = (new Date()).valueOf() - delay;

  this._fetch = function () {

    var remains = (lastCall + delay) - (new Date()).valueOf();

    if (remains > 0) {
      setTimeout(this._fetch.bind(this), remains);
      return;
    }

    lastCall = (new Date()).valueOf();

    supplier.apiCall(method, query, function (err, data, response) {

      if (err || data.error) {
        _this.emit('error', err || data.error);
        return;
      }

      var data = data.response;

      if (!data.items) {
        _this.push(null);
        return;
      }
      
      _this._count += data.items.length;

      _this.push(data);

      var condition = !query['count'] && (_this._count < data.count) || (_this._count < query['count']);

      if (condition) {
        query['offset'] += data.items.length;

        if (query['count'] && (query['count'] < query['offset'] + data.items.length))
          query['count'] = query['count'] - query['offset'];
      }
      else
        _this.push(null);

    });

  }

}


CollectStream.prototype._read = function () {
    this._fetch();
};