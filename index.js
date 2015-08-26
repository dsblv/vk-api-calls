'use strict';

var got = require('got');
var qs = require('querystring');
var camelCase = require('camelcase');
var objectAssign = require('object-assign');
var config = require('./config');
var CollectStream = require('./lib/collect-stream');

module.exports = VK;

function VK(opts, session) {
	if (!(this instanceof VK)) {
		return new VK(opts);
	}

	opts = opts || {};

	this.clientId = opts.clientId;
	this.clientSecret = opts.clientSecret;
	this.redirectUri = opts.redirectUri;
	this.apiVersion = opts.apiVersion || config.apiVersion;
	this.delay = opts.delay || config.delay;

	this.session = session || {};

	this._deferred = [];
}

VK.prototype.setSession = function (data) {
	var now = (new Date()).valueOf();

	this.session = {
		token: data.access_token,
		userId: data.user_id,
		expires: (new Date(now + data.expires_in * 1000)).valueOf()
	};

	return this;
};

VK.prototype.getSession = function () {
	return this.session;
};

VK.prototype.getToken = function () {
	return (this.hasValidToken()) ? this.session.token : undefined;
};

VK.prototype.hasValidToken = function (session) {
	session = session || this.session;

	return Boolean(session) && (session.expires > (new Date()).valueOf());
};

VK.prototype._prepareAuthQuery = function (query, includeSecret) {
	query = query || {};

	var options = [
		'client_id',
		'redirect_uri'
	];

	if (includeSecret || false) {
		options.push('client_secret');
	}

	query = supplyQuery(query, this, options);

	query['v'] = query['v'] || this.apiVersion;

	return query;
};

VK.prototype.renderAuthUrl =
VK.prototype.authUrl = function (query) {
	query = this._prepareAuthQuery(query);
	return [config.authUrl, qs.stringify(query)].join('?');
};

VK.prototype.performSiteAuth =
VK.prototype.siteAuth = function (query, callback) {
	query = this._prepareAuthQuery(query, true);

	var vk = this;
	var promise = got(config.tokenUrl, gotOptions({
		query: query
	})).then(function (res) {
		vk.setSession(res.body);

		if (typeof callback === 'function') {
			callback(null, res.body, res);
		}

		return res;
	});

	return (typeof callback === 'function') ? this : promise;
};

VK.prototype.performServerAuth =
VK.prototype.serverAuth = function (query, callback) {
	query = query || {};
	query['grant_type'] = 'client_credentials';

	return this.performSiteAuth(query, callback);
};

VK.prototype.performApiCall =
VK.prototype.apiCall = function (method, query, callback) {
	if (typeof method !== 'string') {
		throw Error('vkApiCalls: Method name should be a string');
	}

	if (!this.hasValidToken()) {
		throw Error('vkApiCalls: Token is expired or never been set');
	}

	query = query || {};

	query['v'] = query['v'] || this.apiVersion;

	query['access_token'] = this.session.token;

	var url = [config.apiUrl, method].join('/');

	return this._enqueue().then(function () {
		got.post(url, gotOptions({query: query}), callback);
	});
};

VK.prototype.defer = function (method, query) {
	if (typeof method !== 'string') {
		throw Error('vkApiCalls: Method name should be a string');
	}

	this._deferred.push({
		method: method,
		query: query || {}
	});

	return this;
};

VK.prototype.execute = function (query, callback) {
	if (this._deferred.length === 0) {
		throw Error('vkApiCalls: There\'s nothing to execute');
	}

	var calls = this._deferred.map(function (call) {
		return 'API.' + call.method + '(' + JSON.stringify(call.query) + ')';
	});

	query = query || {};

	query['code'] = 'return [' + calls.join(', ') + '];';

	this._deferred = [];

	return this.performApiCall('execute', gotOptions({
		query: query
	}), callback);
};

VK.prototype.collectStream = function (method, query) {
	return new CollectStream(this, method, query);
};

VK.prototype.collect = function (method, query, callback) {
	var _this = this;
	var stored = {
		items: []
	};

	var promise = new Promise(function (resolve, reject) {
		_this.collectStream(method, query).on('data', function (data) {
			stored.items = stored.items.concat(data.items);
			stored.count = data.count;

			console.log(stored.items.length + ' items stored ' + (new Date()));
		}).on('error', function (err) {
			reject(err);

			if (typeof callback === 'function') {
				callback(err, null);
			}
		}).on('end', function () {
			resolve(stored);

			if (typeof callback === 'function') {
				callback(null, stored);
			}
		});
	});

	return (typeof callback === 'function') ? this : promise;
};

VK.prototype._canCall = function () {
	var now = new Date();
	this.nextCall = this.nextCall || now;
	return !(this.nextCall > now);
};

VK.prototype._enqueue = function () {
	var remains = 0;

	if (!this._canCall()) {
		remains = this.nextCall - new Date();
	}

	this.nextCall = new Date(this.nextCall.valueOf() + this.delay);

	return new Promise(function (resolve) {
		setTimeout(resolve, remains);
	});
};

function gotOptions(opts) {
	return objectAssign(config.defaultGotOptions || {}, opts);
}

function supplyQuery(query, source, opts) {
	opts.forEach(function (option) {
		if (!query[option]) {
			if (source[camelCase(option)]) {
				query[option] = source[camelCase(option)];
			} else {
				throw Error('vkApiCalls: Please supply "' + option + '" option');
			}
		}
	});

	return query;
}
