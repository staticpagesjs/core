import assert from 'assert';
import { Readable } from 'stream';
import staticPages from '../esm/index.js';

const seq = n => Array.from({ length: n }, (v, i) => ({ a: i }));
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

function createWriter() {
	async function writer(items) {
		for await (const item of items) output.push(item);
	};
	const output = writer.output = [];
	return writer;
}

describe('Static Pages General Tests', () => {
	it('passes through the input data with minimal configuration', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can recieve multiple conversion tasks', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer1 = createWriter();
		const writer2 = createWriter();

		await staticPages({
			from: input,
			to: writer1,
		}, {
			from: input,
			to: writer2,
		});

		assert.deepStrictEqual(writer1.output, expected);
		assert.deepStrictEqual(writer2.output, expected);
	});

	it('works on iterable inputs', async () => {
		const input = iterableReader(seq(5));
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('works on async iterable inputs', async () => {
		const input = asyncIterableReader(seq(5));
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('works on object stream inputs', async () => {
		const input = streamReader(seq(5));
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('executes the controller which can alter the output', async () => {
		const input = seq(5);
		const expected = seq(5).map(x => ({ a: x.a + 1 }));
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => ({ a: d.a + 1 }),
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('controller can insert additional items to output', async () => {
		const input = seq(5);
		const expected = [];
		for (let i = 0; i < input.length; i++) {
			expected.push({ a: input[i].a + 1 });
			expected.push({ b: input[i].a });
		}
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => [{ a: d.a + 1 }, { b: d.a }],
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('controller can remove items from output', async () => {
		const input = seq(5);
		const expected = seq(5).filter(d => d.a % 2 === 0);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => d.a % 2 === 0 ? d : undefined,
		});

		assert.deepStrictEqual(writer.output, expected);
	});
});
