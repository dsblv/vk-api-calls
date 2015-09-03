var test = require('tap').test;
var VK = require('../');

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['offline', 'photos']
};

test('pre-site-auth checks', function (t) {
	var vk = new VK();

	t.throws(function () {
		vk.performSiteAuth();
	}, 'throws when no code provided');

	t.end();
});

test('authentication', function (t) {
	var vk = new VK(app);

	t.ok(vk.performSiteAuth({code: 'test'}) instanceof Promise, '#performSiteAuth() without callback returns Promise');
	t.ok(vk.performSiteAuth({code: 'test'}, function () {}) instanceof VK, '#performSiteAuth() with callback returns VK');

	t.end();
});
