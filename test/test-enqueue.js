var test = require('tap').test;
var VK = require('../');

test('throttleing requests via _enqueue', function (t) {
	var vk = new VK(null, {
		interval: 1000
	});

	t.plan(2);

	var now = Date.now();

	vk._enqueue()
	.then(function () {
		t.ok(Date.now() - now < 100, 'first request is not delayed');
	});

	vk._enqueue()
	.then(function () {
		t.ok(Date.now() - now >= 900, 'next request is delayed by 1 second');
		t.end();
	});
});
