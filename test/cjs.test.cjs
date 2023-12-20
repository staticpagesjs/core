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

	it('can use the imported "picomatch" package', async () => {
		const input = seq(5);
		const expected = seq(5).filter(x => [0,2,4].includes(x.a));
		const writer = createWriter();

		await staticPages({
			from: {
				backend: {
					tree() { return input.map(x => '' + x.a); },
					read(f) { return input[+f]; },
					write(f, c) { /* not implemented */ }
				},
				pattern: '@(0|2|4)',
				parse(x) { return x; }
			},
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});
});
