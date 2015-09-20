vk-api-calls [![Build Status](https://travis-ci.org/dsblv/vk-api-calls.svg)](https://travis-ci.org/dsblv/vk-api-calls) [![Coverage Status](https://img.shields.io/codecov/c/github/dsblv/vk-api-calls.svg?branch=master)](https://codecov.io/github/dsblv/vk-api-calls?branch=master) [![Dependency Status](https://david-dm.org/dsblv/vk-api-calls.svg)](https://david-dm.org/dsblv/vk-api-calls)
============

> Yet another VK API wrapper for Node.js & io.js.

:exclamation: Despite this module is published on npm and has version 1, it is still heavily under construction. Use it with caution or wait for `2.0.0` which is landing later this week.

## Features

* Simple authentication
* Multiple API calls at once via [execute](http://vk.com/dev/execute)
* Data aggregation
* Automatic request rate stabilization
* Promise-based API


## Install

```sh
npm install --save vk-api-calls
```

## API

* [Constructor]() — one instance of `vk` per user
* [Session methods]() — handle `tokens` like a boss
* [Autnentication]() — all you might need to perform user/server auth
* [Requests]() — this is what it's all about, right?
* [Data aggregation]() — fetch a lot of data without breaking the law
* [Deferred execution]() — optimize your requests
* [Utility]() — useful methods

### Constructor

#### `var vk = new VK([app], [options], [session])`

##### app

Type: `object`

Info about your [app](http://vk.com/apps?act=manage) for future authentication.

###### clientId

Type: `number` or `string`

Your app's ID.

###### clientSecret

Type: `string`

Your app's Secure Key.

###### redirectUri

Type: `string`

Redirect URI as specified in your app's options.

###### scope

Type: `string`, `array` or `number`

List of desirable scopes for your app or calculated bit mask.

###### v

Type: `string` or `number`

[Version of VK API](http://vk.com/dev/versions) you want to work with.


##### options

Type: `object`

Custom **vk-api-calls** settings.

###### interval

Type: `number`  
Default: `666`

Delay for API calls debouncing in milliseconds. Has to be at least 333 because of API restrictions.

###### timeout

Type: `number`  
Default: `30000`

Milliseconds untill `ETIMEDOUT` error is thrown if there's no response from the server.

###### headers

Type: `object`  
Default: `{'user-agent': 'https://github.com/dsblv/vk-api-calls'}`

Headers to be sent with each request. `user-agent` contains a link to this repo by default. Provide some information about your app here so VK server administration will beter know what's going on.


##### session

Type: `object`

Session data: user id, access token and when it expires:

```js
{
	userId: 'USER_ID',
	token: 'ACCESS_TOKEN',
	expires: 1440163431337
}
```

This will help you not to perform authentication each time user visits your page. Save this in your session storage and use until it's expired. If expires is set to `0`, token is assumed to be eternal.

*Note that `expires` value is not relative, but absolute*

---

### Session methods

#### `vk.setSession(data)` → `this`

Saves session data.

##### data

*Required*  
Type: `object`

Data returned by VK API server:

```js
{
	'user_id': 'USER_ID',
	'access_token': 'ACCESS_TOKEN',
	'expires_in': 3600
}
```

*Note that this time `expires_in` is relative. The module will internally convert in to absolute value.*


#### `vk.getSession()` → `object`

Returns session data prepared for storing in session storage.


#### `vk.getToken()` → `string`

Returns current `access token` or `undefined` if it's expired or not set.


#### `vk.hasValidToken()` → `boolean`

Tells if valid token is avalible.

---

### Authentication methods

#### `vk.renderAuthUrl([query])` → `string`

Retutns URL to direct user to for authentication.

##### query

Type: `object`

Query parameters you may want to manually override.


#### `vk.performSiteAuth(query)` → `promise`

*Alias: `vk.siteAuth()`*

Performs [Authorization Code Flow](http://vk.com/dev/auth_sites) auth.

##### query

*Required*  
Type: `object`

Query has only one required parameter — `code` — which is returned by VK API server when user is successfully logged in.

##### callback(error, data, response)

Type: `function`

If callback is supplied, it will be called when server responds. Otherwise, the method returns a Promise.


#### `vk.performServerAuth([query])` → `promise`

*Alias: `vk.serverAuth()`*

Performs [Client Credentials Flow](http://vk.com/dev/auth_server) auth.

##### query

Type: `object`

Query parameters you may want to manually override.

##### callback(error, data, response)

Type: `function`

If callback is supplied, it will be called when server responds. Otherwise, the method returns a Promise.

---

### Request methods

#### `vk.performApiCall(method, [query])` → `promise`

*Alias: `vk.apiCall()`*

Performs API requests.

##### method

*Required*  
Type: `string`

One of [VK API methods](http://vk.com/dev/methods).

##### query

Type: `object`

Query parameters you want to pass to VK API method. Required authentication data will be attached automatically.

##### callback(error, data, response)

Type: `function`

If callback is supplied, it will be called when server responds. Otherwise, the method returns a Promise.


#### `vk.collectStream(method, [query])` → [readable stream](https://nodejs.org/api/stream.html#stream_class_stream_readable)

This metod allows you to get more data than VK restrictions allow by sending multiple requests. Every API response will emit `data` event with received data so you can operatively store it.

Stream emits `data`, `error` and `end` events.

API request rate is limited to match VK API requirements.

##### method

*Required*  
Type: `string`

One of [VK API methods](http://vk.com/dev/methods).

##### query

Type: `object`

Query parameters you want to pass to VK API method. Required authentication data will be attached automatically.

Example:

```js
// your save-to-database module
var save = require('./save');

// let's get 10000 members of a group
// when maximum per request is 1000

var stream = vk.collectStream('groups.getMembers', {
	group_id: 1,
	count: 10000
});

stream.on('data', function (data) {
	save(data.items);
});

stream.on('error', function (error) {
	console.error('wild error appears');
});
```

#### `vk.collect(method, [query])` → `promise`

Wrapper around #collectStream() that collects the whole stream.

Arguments are same as in [#peformApiCall()](#vkperformapicallmethod-query-callback--promisethis)

---

### Deferred execution

**vk-api-calls** provides a way to collect several API calls and run them all at once via [execute method](http://vk.com/dev/execute). This approach can speed up your application, as yo're able to retreive all data you need by one shot.

#### `vk.execution()` → `execution`

This method return an Execution object instance.

#### `execution.push(method, [query])` → `this`

Add an API call to the set.

Arguments are same as in [#peformApiCall()](#vkperformapicallmethod-query-callback--promisethis) except `callback` — no callbacks needed here.

#### `execution.code()` → `string`

Generates `code` for [execution by VK](http://vk.com/dev/execute) at any point of time.

#### `execution.execute([callback])` → `promise/vk-api-calls instance`

Runs the execution via [#peformApiCall()](#vkperformapicallmethod-query-callback--promisethis) with `'execute'` as first argument.

Example:

```js
var exec = vk.execution();

exec
.push('users.get', {user_ids: 1})
.push('wall.get', {owner_id: 1})
.push('photos.get', {owner_id: 1})
.execute()
.then(function (data) {
	console.log('Name: ' + data[0].response.first_name);
	console.log('Wall posts: ' + data[1].response.count);
	console.log('Photos posts: ' + data[2].response.count);
});
```

---

### Utility methods

#### `vk.hasInScope(method)` → `boolean`

Tells if application scope allows you to call particular method. **vk-api-calls** performs this check internally before every call, so you don't need to do it yourself.

##### method

*Required*  
Type: `string`

## License

MIT © [Dmitriy Sobolev](http://vk.com/sobo13v)
