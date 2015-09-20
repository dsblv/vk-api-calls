import test from 'ava';
import VK from '../';

test('rendering query string for authentication requests', t => {
	const app = {
		clientId: 'CLIENT_ID',
		clientSecret: 'CLIENT_SECRET',
		redirectUri: 'REDIRECT_URI',
		scope: 0
	};

	const vk = new VK(app);
	const safeQuery = vk._prepareAuthQuery({hello: 'world'});
	const unsafeQuery = vk._prepareAuthQuery({hello: 'world'}, true);

	t.is(typeof safeQuery.clientSecret, 'undefined', 'safe query doesn\'t contain clientSecret');

	t.is(unsafeQuery.clientSecret, 'CLIENT_SECRET', 'unsafe query contains clientSecret');

	t.end();
});
