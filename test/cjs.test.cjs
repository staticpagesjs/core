const assert = require('node:assert');
const { staticPages } = require('../index.cjs');

const { createSequence } = require('./helpers/createSequence.cjs');
const { createWriter } = require('./helpers/createWriter.cjs');

// If tests ran successfully on the ES module version we
// does not start the same tests on the CJS version.
// Things to tests here:
//   - exports of this module
//   - imports of the dependencies
describe('Static Pages CommonJS Tests', () => {
	it('CJS version is importable and working', async () => {
		const input = createSequence(5);
		const expected = createSequence(5);
		const writer = createWriter();

		await staticPages({
			from: input,
			to: writer,
		});

		assert.deepStrictEqual(writer.output, expected);
	});
});
