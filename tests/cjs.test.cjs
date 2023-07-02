const assert = require('assert');
const staticPages = require('../cjs/index.js').default;

const seq = n => Array.from({ length: n }, (v, i) => ({ a: i }));

function createWriter() {
	async function writer(items) {
		for await (const item of items) output.push(item);
	};
	const output = writer.output = [];
	return writer;
}

describe('Static Pages CJS Tests', () => {
	it('CommonJS version is importable and working', async () => {
		const input = seq(5);
		const expected = seq(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});
});
