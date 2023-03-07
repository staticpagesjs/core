const tap = require('tap');
const { staticPages } = require('../cjs/index.js');

const seq = n => Array.from(new Array(n)).map((v, i) => ({ a: i }));

tap.test('it passes trough the input data with minimal configuration', async () => {
	const input = seq(5);
	const expected = seq(5);

	const output = [];
	const writer = item => output.push(item);

	await staticPages({
		from: input,
		to: writer,
	});

	tap.match(output, expected);
});
