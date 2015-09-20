import test from 'ava';
import VK from '../';
import {Readable as ReadableStream} from 'stream';

const app = {
	clientId: 'CLIENT_ID',
	clientSecret: 'CLIENT_SECRET',
	redirectUri: 'REDIRECT_URI',
	scope: ['offline']
};

const session = {
	token: process.env.VK_API_TOKEN,
	expires: 0
};

test('pre-request checks', t => {
	const vk = new VK(app);

	t.plan(4);

	vk.performApiCall().catch(err => {
		t.ok(err, 'throws without method');
	});

	vk.performApiCall('foobar').catch(err => {
		t.ok(err, 'throws when method unknown');
	});

	vk.performApiCall('groups.leave', {groupId: 1}).catch(err => {
		t.ok(err, 'throws when method is out of scope');
	});

	vk.performApiCall('photos.getAlbumsCount').catch(err => {
		t.ok(err, 'throws when token is needed but not provided');
	});
});

test.serial('making request', t => {
	const vk = new VK(app, null, session);

	return vk.performApiCall('users.get', {userIds: 'sobo13v'}).then(res => {
		t.is(res[0].id, 15658953);
	});
});

test.serial('collect stream', t => {
	const vk = new VK(app);

	t.ok(vk.collectStream('groups.getMembers') instanceof ReadableStream, '#collectStream returns stream.Readable instance');

	t.end();
});

test.serial('collect', t => {
	const vk = new VK(app, null, session);

	return vk.collect('groups.getMembers', {groupId: 'wryubwy'}).then(res => {
		t.ok(typeof res.items !== 'undefined');
	});
});
