var test = require('tape');
var VK = require('../');

var app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI'
};

test('rendering query string for authentication requests', function (t) {
	var vk = new VK(app);
	var safeQuery = vk._prepareAuthQuery({hello: 'world'});
	var unsafeQuery = vk._prepareAuthQuery({hello: 'world'}, true);

	t.same(safeQuery, {
		'client_id': 'CLIENT_ID',
		'hello': 'world',
		'redirect_uri': 'REDIRECT_URI',
		'scope': '',
		'v': 5.37
	}, 'safe query doesn\'t contain clientSecret');

	t.same(unsafeQuery, {
		'client_id': 'CLIENT_ID',
		'client_secret': 'CLIENT_SECRET',
		'hello': 'world',
		'redirect_uri': 'REDIRECT_URI',
		'scope': '',
		'v': 5.37
	}, 'unsafe query contains clientSecret');

	t.end();
});
