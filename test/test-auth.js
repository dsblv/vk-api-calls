import test from 'ava';
import VK from '../';

const app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['offline', 'photos']
};

test('pre-site-auth checks', t => {
	const vk = new VK();

	return vk.performSiteAuth().catch(err => {
		t.ok(err, 'throws when no code provided');
	});
});

test('auth url rendering', t => {
	const vk = new VK(app);

	t.is(vk.renderAuthUrl(), 'https://oauth.vk.com/authorize?scope=65540&v=5.37&client_id=CLIENT_ID&redirect_uri=REDIRECT_URI', 'auth URL rendered correctly');

	t.end();
});

test.serial('site authentication', t => {
	const vk = new VK(app);

	return vk.performSiteAuth({code: 'test'}).catch(() => {
		t.pass('#performSiteAuth() returns Promise');
	});
});

test.serial('server authentication', t => {
	const vk = new VK(app);

	return vk.performServerAuth().catch(() => {
		t.pass('#performServerAuth() returns Promise');
	});
});
