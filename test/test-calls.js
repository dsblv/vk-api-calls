var test = require('tap').test;
var VK = require('../');

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
