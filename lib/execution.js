'use strict';

function Execution(executor) {
	this._calls = [];
	this.limit = 25;
	this.executor = executor;
}

Execution.prototype.push = function (method, query) {
	if (this._calls.length === this.limit) {
		throw new Error('vkApiCalls: limit of executable calls exceeded');
	}

	this._calls.push({
		method: method,
		query: query || {}
	});

	return this;
};

Execution.prototype.code = function () {
	var calls = this._calls.map(function (call) {
		return 'API.' + call.method + '(' + JSON.stringify(call.query) + ')';
	});

	return 'return [' + calls.join(', ') + '];';
};

Execution.prototype.execute = function (callback) {
	if (this._calls.length === 0) {
		throw new Error('vkApiCalls: There\'s nothing to execute');
	}

	var query = {};

	query.code = this.code();

	this._calls = [];

	return this.executor.performApiCall('execute', query, callback);
};

module.exports = Execution;
