var test = require('tap').test;
var VK = require('../');
var ReadableStream = require('stream').Readable;

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['offline', 'photos']
};

test('pre-request checks', function (t) {
	var vk = new VK(app);

	t.plan(4);

	t.throws(function () {
		vk.performApiCall();
	}, 'throws without method');

	t.throws(function () {
		vk.performApiCall('foobar');
	}, 'throws when method unknown');

	t.throws(function () {
		vk.performApiCall('groups.leave', {'group_id': 1});
	}, 'throws when method is out of scope');

	t.throws(function () {
		vk.performApiCall('photos.getAlbumsCount');
	}, 'throws when token is needed but not provided');

	t.end();
});

test('making request', function (t) {
	var vk = new VK(app);

	t.ok(vk.performApiCall('users.get') instanceof Promise, '#performApiCall() without callback returns Promise');
	t.ok(vk.performApiCall('users.get', {}, function () {}) instanceof VK, '#performApiCall() with callback returns VK');
	t.ok(vk.performApiCall('users.get', function () {}) instanceof VK, '#performApiCall() with callback in place of query returns VK');

	t.end();
});

test('collect stream', function (t) {
	var vk = new VK(app);

	t.ok(vk.collectStream('groups.getMembers') instanceof ReadableStream, '#collectStream returns stream.Readable instance');

	t.end();
});
