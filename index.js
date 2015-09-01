'use strict';

var got = require('got');
var qs = require('querystring');
var camelCase = require('camelcase');
var objectAssign = require('object-assign');
var allMethods = require('vk-api-all-methods');
var openMethods = require('vk-api-open-methods');
var config = require('./config');
var CollectStream = require('./lib/collect-stream');
var Execution = require('./lib/execution');

module.exports = VK;

function VK(app, opts, session) {
	if (!(this instanceof VK)) {
		return new VK(opts);
	}

	this.app = app || {};
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
		'redirect_uri'
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
		throw Error('vkApiCalls: Method name should be a string');
	}

	if (!isMethod(method)) {
		throw Error('vkApiCalls: Unknown method');
	}

	if (!isOpenMethod(method) && !this.hasValidToken()) {
		throw Error('vkApiCalls: Token is expired or not set');
	}

	query = query || {};

	query['v'] = query['v'] || this.opts.apiVersion;

	if (!isOpenMethod(method)) {
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

// helper functions

function isMethod(method) {
	return (method.split('.')[0] === 'execute') || (allMethods.indexOf(method) !== -1);
}

function isOpenMethod(method) {
	return (openMethods.indexOf(method) !== -1);
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
