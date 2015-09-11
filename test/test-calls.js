var test = require('tap').test;
var VK = require('../');
var ReadableStream = require('stream').Readable;

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['offline']
};

var session = {
	token: process.env.VK_API_TOKEN,
	expires: 0
};

test('pre-request checks', function (t) {
	var vk = new VK(app);

	vk.performApiCall().catch(function(err) {
		if (err) {
			t.throws(function () {
				throw err;
			}, 'throws without method');
		}
	});

	vk.performApiCall('foobar').catch(function(err) {
		if (err) {
			t.throws(function () {
				throw err;
			}, 'throws when method unknown');
		}
	});

	vk.performApiCall('groups.leave', {'group_id': 1}).catch(function(err) {
		if (err) {
			t.throws(function () {
				throw err;
			}, 'throws when method is out of scope');
		}
	});

	vk.performApiCall('photos.getAlbumsCount').catch(function(err) {
		if (err) {
			t.throws(function () {
				throw err;
			}, 'throws when token is needed but not provided');
		}
	});

	t.end();
});

test('making request', function (t) {
	var vk = new VK(app, null, session);

	t.ok(vk.performApiCall('users.get') instanceof Promise, '#performApiCall() without callback returns Promise');
	t.ok(vk.performApiCall('users.get', {}, function () {}) instanceof VK, '#performApiCall() with callback returns VK');
	t.ok(vk.performApiCall('users.get', function () {}) instanceof VK, '#performApiCall() with callback in place of query returns VK');

	vk.performApiCall('users.search', {q: 'Dima'})
	.then(function () {
		t.pass();
		t.end();
	})
	.catch(function () {
		t.fail();
		t.end();
	});
});

test('collect stream', function (t) {
	var vk = new VK(app);

	t.ok(vk.collectStream('groups.getMembers') instanceof ReadableStream, '#collectStream returns stream.Readable instance');

	t.end();
});

test('#collect()', function (t) {
	var vk = new VK(app, null, session);

	vk.collect('groups.getMembers', {'group_id': 'wryubwy'})
	.then(function () {
		t.pass();
		t.end();
	})
	.catch(function () {
		t.fail();
		t.end();
	});
});
