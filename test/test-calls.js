var test = require('ava');
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

	t.plan(4);

	vk.performApiCall().catch(function (err) {
		t.ok(err, 'throws without method');
	});

	vk.performApiCall('foobar').catch(function (err) {
		t.ok(err, 'throws when method unknown');
	});

	vk.performApiCall('groups.leave', {groupId: 1}).catch(function (err) {
		t.ok(err, 'throws when method is out of scope');
	});

	vk.performApiCall('photos.getAlbumsCount').catch(function (err) {
		t.ok(err, 'throws when token is needed but not provided');
	});
});

test.serial('making request', function (t) {
	var vk = new VK(app, null, session);

	return vk.performApiCall('users.get', {userIds: 'sobo13v'}).then(function () {
		t.pass();
	});
});

test.serial('collect stream', function (t) {
	var vk = new VK(app);

	t.ok(vk.collectStream('groups.getMembers') instanceof ReadableStream, '#collectStream returns stream.Readable instance');

	t.end();
});

test.serial('collect', function (t) {
	var vk = new VK(app, null, session);

	return vk.collect('groups.getMembers', {groupId: 'wryubwy'}).then(function (res) {
		t.ok(typeof res.items !== 'undefined');
	});
});
