'use strict';

var config    = require('./config'),
    qs        = require('querystring'),
    got       = require('got'),
    camelCase = require('camelcase');


module.exports = VK;


function VK (opts, session) {

  if (!(this instanceof VK))
    return new VK(opts);

  opts = opts || {};

  this.clientId     = opts.clientId;
  this.clientSecret = opts.clientSecret;
  this.redirectUri  = opts.redirectUri;
  this.apiVersion   = opts.apiVersion || config.apiVersion;

  this.session      = session || {};

  this._deferred    = [];

};


VK.prototype.setSession = function (data) {

  var now = (new Date()).valueOf();

  this.session = {
    token   : data['access_token'],
    userId  : data['user_id'],
    expires : (new Date(now + data['expires_in']*1000)).valueOf()
  }

  return this;

}


VK.prototype.getSession = function () {

  return this.session;

}


VK.prototype.getToken = function () {

  return (this.hasValidToken()) ? this.session.token : undefined;

}


VK.prototype.hasValidToken = function (session) {

  var session = session || this.session;

  return !!session && (session.expires > (new Date()).valueOf());

}


VK.prototype._prepareAuthQuery = function (query, includeSecret) {

  query = query || {};

  var options = [
    'client_id',
    'redirect_uri'
  ]

  if (includeSecret || false)
    options.push('client_secret');

  query = supplyQuery(query, this, options);

  query['v'] = query['v'] || this.apiVersion;

  return query;

}


VK.prototype.renderAuthUrl = function (query) {

  query = this._prepareAuthQuery(query);

  return [config.authUrl, qs.stringify(query)].join('?');

}


VK.prototype.performSiteAuth = function (query, callback) {

  query = this._prepareAuthQuery(query, true);

  var vk      = this,
      promise = got(config.tokenUrl, gotOptions(query))
      .then(function (res) {

        vk.setSession(res.body);

        if (typeof callback === 'function')
          callback(null, res.body, res);

        return res;
      });

  return (typeof callback === 'function') ? this : promise;

}


VK.prototype.performServerAuth = function (query, callback) {

  query = query || {};

  query['grant_type'] = 'client_credentials';

  return this.performSiteAuth(query, callback);

}


VK.prototype.performApiCall = function (method, query, callback) {

  if (typeof method != 'string')
    throw TypeError('vkApiCalls: Method name should be a string');

  if (!this.hasValidToken())
    throw Error('vkApiCalls: Token is expired or never been set');

  query = query || {};

  query['v'] = query['v'] || this.apiVersion;

  query['access_token'] = this.session.token;

  var url = [config.apiUrl, method].join('/');

  return got.post(url, gotOptions(query), callback);

}


VK.prototype.defer = function (method, query) {

  if (typeof method != 'string')
    throw TypeError('vkApiCalls: Method name should be a string');

  this._deferred.push({
    method   : method,
    query    : query || {}
  });

  return this;

}


VK.prototype.execute = function (query, callback) {

  if (this._deferred.length === 0)
    throw Error('vkApiCalls: There\'s nothing to execute');

  var calls = this._deferred.map(function (call) {
    return 'API.' + call.method + '(' + JSON.stringify(call.query) + ')';
  });

  query = query || {};

  query.code = 'return [' + calls.join(', ') + '];';

  this._deferred = [];

  return this.performApiCall('execute', gotOptions(query), callback);

}


function gotOptions (query) {

  var opts = config.defaultGotOptions || {};
  opts.query = query;
  return opts;

}


function supplyQuery (query, source, opts) {

  opts.forEach(function (option, index, opts) {

    if (!query[option])
      if (source[camelCase(option)])
        query[option] = source[camelCase(option)];
      else
        throw Error('vkApiCalls: Please supply "' + option + '" option');

  });

  return query;
  
}