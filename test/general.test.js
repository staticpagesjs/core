import assert from 'assert';
import staticPages from '../esm/index.js';

import { createSequence } from './helpers/createSequence.cjs';
import { createWriter } from './helpers/createWriter.cjs';
import { arrayToIterable } from './helpers/arrayToIterable.cjs';
import { arrayToAsyncIterable } from './helpers/arrayToAsyncIterable.cjs';
import { arrayToObjectStream } from './helpers/arrayToObjectStream.cjs';

describe('Static Pages General Tests', () => {
	it('passes through the input data with minimal configuration', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can recieve multiple routes', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
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
		const input = arrayToIterable(createSequence(5));
		const expected = createSequence(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('works on async iterable inputs', async () => {
		const input = arrayToAsyncIterable(createSequence(5));
		const expected = createSequence(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('works on object stream inputs', async () => {
		const input = arrayToObjectStream(createSequence(5));
		const expected = createSequence(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('executes the controller which can alter the output', async () => {
		const input = createSequence(5);
		const expected = createSequence(5).map(x => x + 1);
		const writer = createWriter();

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
		const writer = createWriter();

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
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
			controller: (d) => d % 2 === 0 ? d : undefined,
		});

		assert.deepStrictEqual(writer.output, expected);
	});
});
