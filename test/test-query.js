var test = require('ava');
var VK = require('../');

test('rendering query string for authentication requests', function (t) {
	var app = {
		clientId: 'CLIENT_ID',
		clientSecret: 'CLIENT_SECRET',
		redirectUri: 'REDIRECT_URI',
		scope: 0
	};

	var vk = new VK(app);
	var safeQuery = vk._prepareAuthQuery({hello: 'world'});
	var unsafeQuery = vk._prepareAuthQuery({hello: 'world'}, true);

	t.is(typeof safeQuery['client_secret'], 'undefined', 'safe query doesn\'t contain clientSecret');

	t.is(unsafeQuery['client_secret'], 'CLIENT_SECRET', 'unsafe query contains clientSecret');

	t.end();
});
