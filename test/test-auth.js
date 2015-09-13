var test = require('ava');
var VK = require('../');

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['offline', 'photos']
};

test('pre-site-auth checks', function (t) {
	var vk = new VK();

	t.plan(1);

	vk.performSiteAuth().catch(function (err) {
		t.ok(err, 'throws when no code provided');
	});
});

test('auth url rendering', function (t) {
	var vk = new VK(app);

	t.plan(1);

	t.is(vk.renderAuthUrl(), 'https://oauth.vk.com/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&scope=65540&v=5.37', 'auth URL rendered correctly');

	t.end();
});

test.serial('site authentication', function (t) {
	var vk = new VK(app);

	t.plan(2);

	t.ok(vk.performSiteAuth({code: 'test'}) instanceof Promise, '#performSiteAuth() without callback returns Promise');
	t.ok(vk.performSiteAuth({code: 'test'}, function () {}) instanceof VK, '#performSiteAuth() with callback returns VK');

	t.end();
});

test.serial('server authentication', function (t) {
	var vk = new VK(app);

	t.plan(2);

	t.ok(vk.performServerAuth() instanceof Promise, '#performServerAuth() without callback returns Promise');
	t.ok(vk.performServerAuth({}, function () {}) instanceof VK, '#performServerAuth() with callback returns VK');

	t.end();
});
