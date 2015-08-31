var test = require('ava');
var VK = require('../');

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI'
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
	t.is(vk.app.clientId, app.clientId);
	t.is(vk.app.clientSecret, app.clientSecret);
	t.is(vk.app.redirectUri, app.redirectUri);
	t.end();
});

test('updating default options', function (t) {
	var vk = new VK(app, opts);
	t.is(vk.opts.delay, opts.delay);
	t.end();
});

test('accepting session', function (t) {
	var vk = new VK(app, opts, sess);
	t.is(vk.session, sess);
	t.end();
});
