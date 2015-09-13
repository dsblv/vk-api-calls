var test = require('ava');
var VK = require('../');

test('saving session data', function (t) {
	var data = {
		'access_token': 'ACCESS_TOKEN',
		'user_id': 'USER_ID',
		'expires_in': 3600
	};

	var vk = new VK();

	vk.setSession(data);

	t.plan(2);
	t.is(vk.getToken(), 'ACCESS_TOKEN', 'access token saved and returned by #getToken()');
	t.is(vk.getSession().token, 'ACCESS_TOKEN', 'session is saved and returned by #getSession()');
	t.end();
});

test('token validation', function (t) {
	var goodData = {
		'access_token': 'ACCESS_TOKEN',
		'user_id': 'USER_ID',
		'expires_in': 3600
	};

	var eternalData = {
		'access_token': 'ACCESS_TOKEN',
		'user_id': 'USER_ID',
		'expires_in': 0
	};

	var badData = {
		'access_token': 'ACCESS_TOKEN',
		'user_id': 'USER_ID',
		'expires_in': -1
	};

	var vk = new VK();

	t.plan(3);

	vk.setSession(goodData);
	t.ok(vk.hasValidToken(), '#hasValidToken() retutns TRUE when token isn\'t expired');

	vk.setSession(eternalData);
	t.ok(vk.hasValidToken(), '#hasValidToken() retutns TRUE when token is eternal');

	vk.setSession(badData);
	t.notOk(vk.hasValidToken(), '#hasValidToken() retutns FALSE when token is expired');

	t.end();
});
