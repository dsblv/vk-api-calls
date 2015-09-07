var test = require('tap').test;
var VK = require('../');

var session = {
	token: process.env.VK_API_TOKEN,
	expires: 0
};

test('deferring calls for multiple execution', function (t) {
	var vk = new VK();
	var exec = vk.execution();

	exec.push('hello', {foo: 'bar'}).push('world');

	t.is(exec.code(), 'return [API.hello({"foo":"bar"}), API.world({})];', '#code() renders proper code');

	t.end();
});

test('limiting the amount of calls', function (t) {
	var vk = new VK();
	var exec = vk.execution();

	for (var i = 0; i < 25; i++) {
		exec.push('users.get', {'user_ids': i});
	}

	t.throws(function () {
		exec.push('users.get', {'user_ids': i});
	}, 'throwing when limit exceeded');

	t.end();
});

test('deferred execution', function (t) {
	var vk = new VK(null, null, session);
	var exec = vk.execution();

	t.throws(function () {
		exec.execute();
	}, 'throwing when nothing to execute');

	exec.push('users.get', {'user_ids': 1});

	t.ok(exec.execute() instanceof Promise, 'without callback returns Promise');

	t.end();
});
