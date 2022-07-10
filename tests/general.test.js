const { Readable, Writable } = require('stream');
const { staticPages } = require('../cjs/index');

const seq = n => Array.from(new Array(n)).map((v, i) => ({ a: i }));

const iterableReader = function* (source) { yield* source; };
const asyncIterableReader = async function* (source) { yield* source; };
const streamReader = function (source) {
	return new Readable({
		objectMode: true,
		read() {
			this.push(source.shift() || null);
		}
	});
};

const streamWriter = new Writable({
	objectMode: true,
	write(chunk, encoding, callback) {
		console.log(chunk);
		callback();
	}
});

test('it passes trough the input data with minimal configuration', async () => {
	const input = seq(5);
	const expected = seq(5);

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
	}]);

	expect(output).toStrictEqual(expected);
});

test('works on iterable inputs', async () => {
	const input = iterableReader(seq(5));
	const expected = seq(5);

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
	}]);

	expect(output).toStrictEqual(expected);
});

test('works on async iterable inputs', async () => {
	const input = asyncIterableReader(seq(5));
	const expected = seq(5);

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
	}]);

	expect(output).toStrictEqual(expected);
});

test('works on object stream inputs', async () => {
	const input = streamReader(seq(5));
	const expected = seq(5);

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
	}]);

	expect(output).toStrictEqual(expected);
});

test('it executes the controller which can alter the output', async () => {
	const input = seq(5);
	const expected = seq(5).map(x => ({ a: x.a + 1 }));

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
		controller: (d) => ({ a: d.a + 1 }),
	}]);

	expect(output).toStrictEqual(expected);
});

test('controller can insert additional items to output', async () => {
	const input = seq(5);
	const expected = [];
	for (let i = 0; i < input.length; i++) {
		expected.push({ a: input[i].a + 1 });
		expected.push({ b: input[i].a });
	}

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
		controller: (d) => [{ a: d.a + 1 }, { b: d.a }], // output two items for each input item
	}]);

	expect(output).toStrictEqual(expected);
});

test('controller can remove items from output', async () => {
	const input = seq(5);
	const expected = seq(5).filter(x => x.a % 2 === 0);

	const output = [];
	const writer = item => output.push(item);

	await staticPages([{
		from: input,
		to: writer,
		controller: (d) => d.a % 2 === 0 ? d : undefined, // mod2? d / nothing
	}]);

	expect(output).toStrictEqual(expected);
});
