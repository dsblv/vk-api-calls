vk-api-calls [![Build Status](https://img.shields.io/travis/dsblv/vk-api-calls.svg?style=flat-square)](https://travis-ci.org/dsblv/vk-api-calls)
============

> Yet another VK API wrapper for Node.js & io.js.

## Features

* (Kind of) easy authentication
* Multiple API calls at once via [execute](http://vk.com/dev/execute)
* Collecting paged data
* Automatic request rate throttleing
* Callbacks/Promises agnostic

## Installing
**the module not yet published**

```sh
npm install --save vk-api-calls
```

## API

### Constructor

#### `var vk = new VK([app], [options], [session])`

##### app

Type: `object`

Info about your [app](http://vk.com/apps?act=manage) for future authentication:

```js
{
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI'
}
```

##### options

Type: `object`

Custom module settings, defaults are:

```js
{
	apiVersion: 5.37,
	authUrl: 'https://oauth.vk.com/authorize',
	tokenUrl: 'https://oauth.vk.com/access_token',
	apiUrl: 'https://api.vk.com/method',
	delay: 666,
	afterError: 60000,

	defaultGotOptions: {
		json: true,
		timeout: 30000,
		headers: {
			'user-agent': 'https://github.com/dsblv/vk-api-calls'
		}
	}
}
```

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

This will help you not to perform authentication each time user visits your page. Save this in your session storage and use until it's expired.

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


#### `vk.performSiteAuth(query, [callback])` → `promise/this`

*Alias: `vk.siteAuth()`*

Performs [Authorization Code Flow](http://vk.com/dev/auth_sites) auth.

##### query

*Required*  
Type: `object`

Query has only one required parameter — `code` — which is returned by VK API server when user is successfully logged in.

##### callback(error, data, response)

Type: `function`

If callback is supplied, it will be called when server responds. Otherwise, the method returns a Promise.


#### `vk.performServerAuth([query], [callback])` → `promise/this`

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

#### `vk.performApiCall(method, [query], [callback])` → `promise/this`

*Alias: `vk.apiCall()`*

Performs API requests.

##### method

*Required*  
Type: `string`

One of [VK API methods](http://vk.com/dev/methods).

##### query

Type: `object`

Query parameters you watnt to pass to VK API method. Required authentication data will be attached automatically.

##### callback(error, data, response)

Type: `function`

If callback is supplied, it will be called when server responds. Otherwise, the method returns a Promise.

## License

MIT © [Dmitriy Sobolev](http://vk.com/sobo13v)
