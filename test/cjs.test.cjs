const assert = require('assert');
const { staticPages } = require('../cjs/index.js');

const { createSequence } = require('./helpers/createSequence.cjs');
const { createMockWriter } = require('./helpers/createMockWriter.cjs');
const { createMockFs } = require('./helpers/createMockFs.cjs');
const { createFileEntry } = require('./helpers/createFileEntry.cjs');

// If tests ran successfully on the ES module version we
// does not start the same tests on the CJS version.
// Things to tests here:
//   - exports of this module
//   - imports of the dependencies
describe('Static Pages CommonJS Tests', () => {
	it('CJS version is importable and working', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer = createMockWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can use the "picomatch" package', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);
		const expected = Object.fromEntries(
			createSequence(5)
				.filter(i => [0,2,4].includes(i))
				.map(i => [`public/file-${i}.html`, `content-${i}`])
		);
		const output = {};
		const mockFs = createMockFs(input, output);

		await staticPages({
			from: {
				fs: mockFs,
				pattern: '**/file-@(0|2|4).*',
			},
			to: {
				fs: mockFs,
			},
		});

		assert.deepStrictEqual(output, expected);
	});

	it('can use the "yaml" package', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'yaml'))
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

	it('can use the "gray-matter" package', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'md'))
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
});
