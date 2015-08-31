var test = require('ava');
var VK = require('../');

test('throttleing requests via _enqueue', function (t) {
	var vk = new VK(null, {
		delay: 1000
	});

	t.plan(2);

	var now = Date.now();

	vk._enqueue()
	.then(function () {
		t.assert(Date.now() - now < 10);
	});

	return vk._enqueue()
	.then(function () {
		t.assert(Date.now() - now >= 1000);
	});
});
