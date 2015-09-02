'use strict';

var got = require('got');
var qs = require('querystring');
var camelCase = require('camelcase');
var objectAssign = require('object-assign');
var vkUtil = require('vk-api-util');
var config = require('./config');
var CollectStream = require('./lib/collect-stream');
var Execution = require('./lib/execution');

module.exports = VK;

function VK(app, opts, session) {
	if (!(this instanceof VK)) {
		return new VK(opts);
	}

	this.app = app || {};

	if (this.app.scope instanceof Array) {
		this.app.scope = this.app.scope.join(',');
	} else {
		this.app.scope = (typeof this.app.scope === 'string') ? this.app.scope : '';
	}

	this.opts = objectAssign(config, opts);
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
		'redirect_uri',
		'scope'
	];

	if (includeSecret || false) {
		options.push('client_secret');
	}

	query = supplyQuery(query, this.app, options);

	query['v'] = query['v'] || this.opts.apiVersion;

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

	var _this = this;

	var promise = got(this.opts.tokenUrl, this._gotOptions({
		query: query
	}))
	.then(function (res) {
		_this.setSession(res.body);

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
		throw new Error('Method name should be a string');
	}

	if (!vkUtil.isMethod(method)) {
		throw new Error('Unknown method');
	}

	if (!this.hasInScope(method)) {
		throw new Error('Method "' + method + '" is not in your application\'s scope');
	}

	if (!vkUtil.isOpenMethod(method) && !this.hasValidToken()) {
		throw new Error('Token is expired or not set');
	}

	query = query || {};

	query['v'] = query['v'] || this.opts.apiVersion;

	if (!vkUtil.isOpenMethod(method)) {
		query['access_token'] = this.session.token;
	}

	var url = [config.apiUrl, method].join('/');

	var _this = this;

	return this._enqueue().then(function () {
		got.post(url, _this._gotOptions({query: query}), callback);
	});
};

VK.prototype.execution = function () {
	return new Execution(this);
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
		_this.collectStream(method, query)
		.on('data', function (data) {
			data.items = stored.items.concat(data.items);
			stored = objectAssign(stored, data);
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

	return (typeof callback === 'function') ? this : promise;
};

VK.prototype.hasInScope = function (method) {
	return vkUtil.isMethodInScope(method, this.app.scope);
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
		this.nextCall = new Date(this.nextCall.valueOf() + this.opts.delay);
	} else {
		this.nextCall = new Date(Date.now() + this.opts.delay);
	}

	return new Promise(function (resolve) {
		setTimeout(resolve, remains);
	});
};

VK.prototype._gotOptions = function (opts) {
	return objectAssign(this.opts.defaultGotOptions || {}, opts);
};

function supplyQuery(query, source, opts) {
	opts.forEach(function (option) {
		if (!query[option]) {
			if (typeof source[camelCase(option)] !== 'undefined') {
				query[option] = source[camelCase(option)];
			} else {
				throw new Error('Please supply "' + option + '" option');
			}
		}
	});

	return query;
}
