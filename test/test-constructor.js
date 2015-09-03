var test = require('tap').test;
var VK = require('../');

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['wall', 'friends']
};

var opts = {
	delay: 333
};

var sess = {
	userId: 'USER_ID',
	token: 'ACCESS_TOKEN',
	expires: 84600
};

test('accepting app data', function (t) {
	var vk = new VK(app);
	t.is(vk.app.clientId, app.clientId, 'clientId saved');
	t.is(vk.app.clientSecret, app.clientSecret, 'clientSecret saved');
	t.is(vk.app.redirectUri, app.redirectUri, 'redirectUri saved');
	t.is(vk.app.scope, 'wall,friends', 'scope saves and transformed to string');
	t.end();
});

test('updating default options', function (t) {
	var vk = new VK(app, opts);
	t.is(vk.opts.delay, opts.delay, 'delay overriden');
	t.end();
});

test('accepting session', function (t) {
	var vk = new VK(app, opts, sess);
	t.is(vk.session, sess, 'session data saved');
	t.end();
});
