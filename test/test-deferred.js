var test = require('tape');
var VK = require('../');

test('deferring calls for multiple execution', function (t) {
	var vk = new VK();
	var exec = vk.execution();

	exec.push('hello', {foo: 'bar'}).push('world');

	t.is(exec.code(), 'return [API.hello({"foo":"bar"}), API.world({})];', '#code() renders proper code');

	t.end();
});
