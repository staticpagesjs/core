import assert from 'assert';
import staticPages from '../esm/index.js';

import { createSequence } from './helpers/createSequence.cjs';
import { createMockWriter } from './helpers/createMockWriter.cjs';
import { arrayToObjectStream } from './helpers/arrayToObjectStream.cjs';
import { arrayToIterable } from './helpers/arrayToIterable.cjs';
import { arrayToAsyncIterable } from './helpers/arrayToAsyncIterable.cjs';
import { createFileEntry } from './helpers/createFileEntry.cjs';
import { createMockFs } from './helpers/createMockFs.cjs';


describe('Static Pages General Tests', () => {
	it('passes through the input data with minimal configuration', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can recieve multiple routes', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer1 = createMockWriter();
		const writer2 = createMockWriter();

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
		const input = arrayToIterable(createSequence(5));
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('works on async iterable inputs', async () => {
		const input = arrayToAsyncIterable(createSequence(5));
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('works on object stream inputs', async () => {
		const input = arrayToObjectStream(createSequence(5));
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('executes the controller which can alter the output', async () => {
		const input = createSequence(5);
		const expected = createSequence(5).map(x => x + 1);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => d + 1,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('controller can insert additional items to output', async () => {
		const input = createSequence(5);
		const expected = [];
		for (let i = 0; i < input.length; i++) {
			expected.push({ a: input[i] + 1 });
			expected.push({ b: input[i] });
		}
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => [{ a: d + 1 }, { b: d }],
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('controller can remove items from output', async () => {
		const input = createSequence(5);
		const expected = createSequence(5).filter(d => d % 2 === 0);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => d % 2 === 0 ? d : undefined,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can set defaults using .with() call', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages.with({
			to: writer,
		})({
			from: input,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can chain multiple .with() calls', async () => {
		const input = createSequence(5);
		const expected = createSequence(5).map(x => x + 1);
		const writer = createMockWriter();

		await staticPages.with({
			to: writer,
			controller(x) { return x; }
		}).with({
			controller: undefined // undefined does nothing
		}).with({
			controller(x) { return x + 1; }
		})({
			controller: undefined, // undefined does nothing
			from: input
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can chain multiple .with() calls and remove defaults with null value', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages.with({
			to: writer,
		}).with({
			controller(x) { return x + 1; }
		})({
			controller: null, // null removes defaults
			from: input
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('uses the CreateReader interface correctly', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'md'))
		);
		const expected = createSequence(5)
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));
		const writer = createMockWriter();

		await staticPages({
			from: {
				fs: createMockFs(input),
			},
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('the CreateReader options can be merged using .with() calls', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`))
		);
		const expected = createSequence(5)
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));
		const writer = createMockWriter();

		await staticPages.with({
			from: {
				parse(x) { return x; }
			},
		})({
			from: {
				fs: createMockFs(input),
			},
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('uses the CreateWriter interface correctly', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);
		const expected = Object.fromEntries(
			createSequence(5)
				.map(i => [`public/file-${i}.html`, `content-${i}`])
		);

		const output = {};
		const mockFs = createMockFs(input, output);

		await staticPages({
			from: {
				fs: mockFs,
			},
			to: {
				fs: mockFs,
			},
		});

		assert.deepStrictEqual(output, expected);
	});

	it('the CreateWriter options can be merged using .with() calls', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);
		const expected = Object.fromEntries(
			createSequence(5)
				.map(i => [`public/file-${i}.html`, `file-${i}`])
		);

		const output = {};
		const mockFs = createMockFs(input, output);

		await staticPages.with({
			to: {
				fs: mockFs,
			}
		})({
			from: {
				fs: mockFs,
			},
			to: {
				render(x) { return x.url; }
			},
		});

		assert.deepStrictEqual(output, expected);
	});
});
