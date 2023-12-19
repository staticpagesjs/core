import assert from 'assert';
import { createReader } from '../esm/index.js';

const minimalBackend = {
	tree(){ return ['1', '2']; },
	read(f){ return { '1': '"one"', '2': '"two"' }[f]; },
	write(){}
};

describe('Static Pages CreateReader Tests', () => {
	it('successfully reads with minimal configuration', async () => {
		const expected = ['one', 'two'];
		const recieved = [];

		const reader = createReader({
			backend: minimalBackend,
		});

		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can use pattern based filtering', async () => {
		const expected = ['two'];
		const recieved = [];

		const reader = createReader({
			backend: minimalBackend,
			pattern: '2'
		});

		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can use ignore pattern based filtering', async () => {
		const expected = ['two'];
		const recieved = [];

		const reader = createReader({
			backend: minimalBackend,
			ignore: '1'
		});

		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can handle errors', async () => {
		const expected = 'Some error thrown.';
		let recieved = null;

		const reader = createReader({
			backend: minimalBackend,
			parse() { throw new Error('Some error thrown.'); },
			catch(error) {
				recieved = error.message;
			}
		});

		await reader.next();

		assert.deepStrictEqual(recieved, expected);
	});

	it('should throw with default settings', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: minimalBackend,
				parse() { throw new Error('Some error thrown.'); },
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});

	it('calls finally when iteration done', async () => {
		const expected = ['one', 'two', 'finally'];
		const recieved = [];

		const reader = createReader({
			backend: minimalBackend,
			finally() {
				recieved.push('finally');
			}
		});

		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('should throw when "backend.tree" returns non iterable', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: {
					tree(){ return 123; }, // should be iterable
					read(){ return 789; }, // should be string | UInt8Array
					write(){}
				},
			});

			await reader.next();

		}, { message: `Expected 'Iterable' or 'AsyncIterable' at 'backend.tree()' call.` });
	});
});
