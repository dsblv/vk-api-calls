import test from 'ava';
import VK from '../';

const app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['wall', 'friends']
};

const opts = {
	delay: 333
};

const sess = {
	userId: 'USER_ID',
	token: 'ACCESS_TOKEN',
	expires: 84600
};

test('automatic instance creation', t => {
	const vk = new VK(app);
	t.ok(vk instanceof VK, 'new instance created without "new"');
	t.end();
});

test('accepting app data', t => {
	const vk = new VK(app);
	t.is(vk.app.clientId, app.clientId, 'clientId saved');
	t.is(vk.app.clientSecret, app.clientSecret, 'clientSecret saved');
	t.is(vk.app.redirectUri, app.redirectUri, 'redirectUri saved');
	t.is(vk.app.scope, 8194, 'scope saves and transformed to bit mask');
	t.end();
});

test('updating default options', t => {
	const vk = new VK(app, opts);
	t.is(vk.opts.delay, opts.delay, 'delay overriden');
	t.end();
});

test('accepting session', t => {
	const vk = new VK(app, opts, sess);
	t.is(vk.session, sess, 'session data saved');
	t.end();
});
