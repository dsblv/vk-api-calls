import test from 'ava';
import VK from '../';

const session = {
	token: process.env.VK_API_TOKEN,
	expires: 0
};

test('deferring calls for multiple execution', t => {
	const vk = new VK();
	const exec = vk.execution();

	exec.push('hello', {foo: 'bar'}).push('world');

	t.is(exec.code(), 'return [API.hello({"foo":"bar"}), API.world({})];', '#code() renders proper code');

	t.end();
});

test('limiting the amount of calls', t => {
	const vk = new VK();
	const exec = vk.execution();

	for (let i = 0; i < 25; i++) {
		exec.push('users.get', {userIds: i});
	}

	t.throws(() => {
		exec.push('users.get', {userIds: 26});
	}, 'throwing when limit exceeded');

	t.end();
});

test.serial('deferred execution', t => {
	const vk = new VK(null, null, session);
	const exec = vk.execution();

	t.throws(() => {
		exec.execute();
	}, 'throwing when nothing to execute');

	exec.push('users.get', {userIds: 1});

	t.ok(exec.execute() instanceof Promise, 'without callback returns Promise');

	t.end();
});
