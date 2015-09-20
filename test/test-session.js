import test from 'ava';
import VK from '../';
import {goodData, badData, eternalData} from './fixtures/sessions.json';

test('saving session data', t => {
	var vk = new VK();

	vk.setSession(goodData);

	t.plan(2);
	t.is(vk.getToken(), 'ACCESS_TOKEN', 'access token saved and returned by #getToken()');
	t.is(vk.getSession().token, 'ACCESS_TOKEN', 'session is saved and returned by #getSession()');
	t.end();
});

test('token validation', t => {
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
