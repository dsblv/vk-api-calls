var test = require('tape');
var VK = require('../');

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['wall', 'friends']
};

test('checking method reachability', function (t) {
	var vk = new VK(app);

	t.ok(vk.hasInScope('wall.post'), 'has scoped method in scope');
	t.ok(vk.hasInScope('users.get'), 'has open method in scope');
	t.notOk(vk.hasInScope('photos.save'), 'doesn\'t have unscoped method in scope');

	t.end();
});
