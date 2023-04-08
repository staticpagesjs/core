import tap from 'tap';
import { Readable } from 'stream';
import { staticPages } from '../esm/index.js';

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

tap.test('it passes trough the input data with minimal configuration', async () => {
	const input = seq(5);
	const expected = seq(5);

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
	});

	tap.match(output, expected);
});

tap.test('works on iterable inputs', async () => {
	const input = iterableReader(seq(5));
	const expected = seq(5);

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
	});

	tap.match(output, expected);
});

tap.test('works on async iterable inputs', async () => {
	const input = asyncIterableReader(seq(5));
	const expected = seq(5);

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
	});

	tap.match(output, expected);
});

tap.test('works on object stream inputs', async () => {
	const input = streamReader(seq(5));
	const expected = seq(5);

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
	});

	tap.match(output, expected);
});

tap.test('it executes the controller which can alter the output', async () => {
	const input = seq(5);
	const expected = seq(5).map(x => ({ a: x.a + 1 }));

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
		controller: (d) => ({ a: d.a + 1 }),
	});

	tap.match(output, expected);
});

tap.test('controller can insert additional items to output', async () => {
	const input = seq(5);
	const expected = [];
	for (let i = 0; i < input.length; i++) {
		expected.push({ a: input[i].a + 1 });
		expected.push({ b: input[i].a });
	}

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
		controller: (d) => [{ a: d.a + 1 }, { b: d.a }], // output two items for each input item
	});

	tap.match(output, expected);
});

tap.test('controller can remove items from output', async () => {
	const input = seq(5);
	const expected = seq(5).filter(x => x.a % 2 === 0);

	const output = [];
	const writer = item => { if (!item.done) output.push(item.value); };

	await staticPages({
		from: input,
		to: writer,
		controller: (d) => d.a % 2 === 0 ? d : undefined, // mod2? d / nothing
	});

	tap.match(output, expected);
});

tap.test('writer.teardown() is called on end', async () => {
	const input = seq(5);

	const expected = true;
	let output = false;
	const writer = item => { if (item.done) output = true; };

	await staticPages({
		from: input,
		to: writer,
	});

	tap.equal(output, expected);
});
