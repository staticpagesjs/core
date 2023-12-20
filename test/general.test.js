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

	it('can recieve multiple routes', async () => {
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

	it('can set defaults using .with() call', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages.with({
			to: writer,
		})({
			from: input,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can chain multiple .with() calls', async () => {
		const input = seq(5);
		const expected = seq(5).map(x => ({ a: x.a + 1 }));
		const writer = createWriter();

		await staticPages.with({
			to: writer,
			controller(x) { return x; }
		}).with({
			controller: undefined // undefined does nothing
		}).with({
			controller(x) { return { a: x.a + 1}; }
		})({
			controller: undefined, // undefined does nothing
			from: input
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can chain multiple .with() calls and remove defaults with null value', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages.with({
			to: writer,
		}).with({
			controller(x) { return { a: x.a + 1}; }
		})({
			controller: null, // null removes defaults
			from: input
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('uses the CreateReader interface correctly', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: {
				backend: {
					tree() { return input; },
					read(f) { return f; },
					write(f, c) { /* not implemented */ }
				},
				parse(x) { return x; }
			},
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('the CreateReader options can be merged using .with() calls', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages.with({
			from: {
				backend: {
					tree() { return input; },
					read(f) { return f; },
					write(f, c) { /* not implemented */ }
				},
			},
		})({
			from: {
				parse(x) { return x; }
			},
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('uses the CreateWriter interface correctly', async () => {
		const input = seq(5);
		const expected = seq(5);
		const output = [];
		const mockBackend = {
			tree() { return input; },
			read(f) { return f; },
			write(f, c) { output.push(c); }
		};

		await staticPages({
			from: {
				backend: mockBackend,
				parse(x) { return x; }
			},
			to: {
				backend: mockBackend,
				render(x) { return x; }
			},
		});

		assert.deepStrictEqual(output, expected);
	});

	it('the CreateWriter options can be merged using .with() calls', async () => {
		const input = seq(5);
		const expected = seq(5);
		const output = [];
		const mockBackend = {
			tree() { return input; },
			read(f) { return f; },
			write(f, c) { output.push(c); }
		};

		await staticPages.with({
			to: {
				backend: mockBackend
			}
		})({
			from: {
				backend: mockBackend,
				parse(x) { return x; }
			},
			to: {
				render(x) { return x; }
			},
		});

		assert.deepStrictEqual(output, expected);
	});
});
