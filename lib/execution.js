function Execution(executor) {
	this._calls = [];
	this.executor = executor;
}

Execution.prototype.add = function (method, query) {
	if (this._calls.length === this.limit) {
		throw Error('vkApiCalls: limit of executable calls exceeded');
	}

	this._calls.push({
		method: method,
		query: query || {}
	});

	return this;
};

Execution.prototype.execute = function (query, callback) {
	if (this._deferred.length === 0) {
		throw Error('vkApiCalls: There\'s nothing to execute');
	}

	var calls = this._deferred.map(function (call) {
		return 'API.' + call.method + '(' + JSON.stringify(call.query) + ')';
	});

	query = query || {};

	query['code'] = 'return [' + calls.join(', ') + '];';

	this._calls = [];

	return this.executor.performApiCall('execute', query, callback);
};

module.exports = Execution;
