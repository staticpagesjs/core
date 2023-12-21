const assert = require('assert');
const { staticPages } = require('../cjs/index.js');
const { createMockFs } = require('./helpers/createMockFs.cjs');

const seq = n => Array.from({ length: n }, (v, i) => i);

function createWriter() {
	async function writer(items) {
		for await (const item of items) output.push(item);
	};
	const output = writer.output = [];
	return writer;
}

// If tests ran successfully on the ES module version we
// does not start the same tests on the CJS version.
// Things to tests here:
//   - imports of the dependencies
//   - exports of this module
describe('Static Pages CommonJS Tests', () => {
	it('CJS version is importable and working', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});

	it('can use the "picomatch" package', async () => {
		const input = Object.fromEntries(
			seq(5)
				.map(x => ['file-' + x, JSON.stringify({ url: 'file-' + x, body: x })])
		);
		const expected = Object.fromEntries(
			seq(5)
				.filter(x => [0,2,4].includes(x))
				.map(x => ['./file-' + x + '.html', { url: 'file-' + x, body: x }])
		);
		const output = {};
		const mockFs = createMockFs(input, output);

		await staticPages({
			from: {
				fs: mockFs,
				pattern: 'file-@(0|2|4)',
			},
			to: {
				fs: mockFs,
				render(d) { return d; },
			},
		});

		assert.deepStrictEqual(output, expected);
	});
});
