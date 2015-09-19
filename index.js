'use strict';

var qs = require('querystring');
var vkGot = require('vk-got');
var decamelize = require('decamelize');
var objectAssign = require('object-assign');
var vkUtil = require('vk-api-util');
var Queue = require('queue-up');
var CollectStream = require('./lib/collect-stream');
var collect = require('./lib/collect');
var Execution = require('./lib/execution');
var defaults = require('./defaults.json');

var VK = module.exports = function (app, opts, session) {
	if (!(this instanceof VK)) {
		return new VK(opts);
	}

	this.app = objectAssign(defaults.app, app);
	this.app.scope = vkUtil.bitMask(this.app.scope);

	this.opts = objectAssign(defaults.options, opts);
	this.session = session || {};

	var queue = new Queue(this.opts.interval);
	this._enqueue = queue.enqueue.bind(queue);
};

VK.prototype.setSession = function (data) {
	this.session = {
		token: data.access_token,
		userId: data.user_id,
		expires: (data.expires_in === 0) ? 0 : Date.now() + data.expires_in * 1000
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

	return Boolean(session) && (session.expires === 0 || session.expires > Date.now());
};

VK.prototype._prepareAuthQuery = function (query, includeSecret) {
	query = query || {};

	var options = [
		'clientId',
		'redirectUri',
		'scope',
		'v'
	];

	if (includeSecret) {
		options.push('clientSecret');
	}

	var source = this.app;

	options.forEach(function (option) {
		if (!query[option]) {
			if (typeof source[option] !== 'undefined') {
				query[option] = source[option];
			} else {
				throw new TypeError('Please supply "' + option + '" option');
			}
		}
	});

	return query;
};

VK.prototype.renderAuthUrl =
VK.prototype.authUrl = function (query) {
	query = this._prepareAuthQuery(query);

	Object.keys(query).forEach(function (key) {
		var dcKey = decamelize(key, '_');

		query[dcKey] = query[key];

		if (dcKey !== key) {
			delete query[key];
		}
	});

	return [defaults.endpoints.auth, qs.stringify(query)].join('?');
};

VK.prototype._performAuth = function (query) {
	var _this = this;

	return vkGot.token({
		body: query,
		timeout: _this.opts.timeout,
		headers: _this.opts.headers
	}).then(function (res) {
		_this.setSession(res.body);
		return res;
	});
};

VK.prototype.performSiteAuth =
VK.prototype.siteAuth = function (query) {
	if (!query || typeof query.code === 'undefined') {
		return Promise.reject(new TypeError('Authorization Code Flow requires CODE parameter'));
	}

	query = this._prepareAuthQuery(query, true);

	return this._performAuth(query);
};

VK.prototype.performServerAuth =
VK.prototype.serverAuth = function (query) {
	query = this._prepareAuthQuery(query, false);

	query.grantType = 'client_credentials';

	return this._performAuth(query);
};

VK.prototype.performApiCall =
VK.prototype.apiCall = function (method, query) {
	if (typeof method !== 'string') {
		return Promise.reject(new TypeError('Method name should be a string'));
	}

	if (!vkUtil.isMethod(method)) {
		return Promise.reject(new TypeError('Unknown method'));
	}

	if (!this.hasInScope(method)) {
		return Promise.reject(new TypeError('Method "' + method + '" is not in your application\'s scope'));
	}

	if (!vkUtil.isOpenMethod(method) && !this.hasValidToken()) {
		return Promise.reject(new Error('Token is expired or not set'));
	}

	query = objectAssign({}, query, {
		v: this.app.v
	});

	var token = (!vkUtil.isOpenMethod(method)) ? this.session.token : null;
	var _this = this;

	return this._enqueue().then(function () {
		return vkGot(method, {
			token: token,
			body: query,
			timeout: _this.opts.timeout,
			headers: _this.opts.headers
		});
	});
};

VK.prototype.execution = function () {
	return new Execution(this);
};

VK.prototype.collectStream = function (method, query) {
	return new CollectStream(this, method, query);
};

VK.prototype.collect = collect;

VK.prototype.hasInScope = function (method) {
	return vkUtil.isMethodInScope(method, this.app.scope);
};
