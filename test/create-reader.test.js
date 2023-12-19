import assert from 'assert';
import { createReader } from '../esm/index.js';

const mockBackend = {
	tree(){ return ['1', '2']; },
	read(f){ return { '1': '"one"', '2': '"two"' }[f]; },
	write(){}
};

describe('Static Pages CreateReader Tests', () => {
	it('successfully reads with minimal configuration', async () => {
		const expected = ['one', 'two'];
		const recieved = [];

		const reader = createReader({
			backend: mockBackend,
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
			backend: mockBackend,
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
			backend: mockBackend,
			ignore: '1'
		});

		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('calls finally when iteration done', async () => {
		const expected = ['one', 'two', 'finally'];
		const recieved = [];

		const reader = createReader({
			backend: mockBackend,
			finally() {
				recieved.push('finally');
			}
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
			backend: mockBackend,
			parse() { throw new Error('Some error thrown.'); },
			catch(error) {
				recieved = error.message;
			}
		});

		await reader.next();

		assert.deepStrictEqual(recieved, expected);
	});

	it('should throw with default settings on reading/parsing errors', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				parse() { throw new Error('Some error thrown.'); },
			});

			await reader.next();

		}, { message: `Some error thrown.` });
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

	it('should throw when "backend" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: 1,
			});

			await reader.next();

		}, { message: `Expected 'Backend' implementation at 'backend' property.` });
	});

	it('should throw when "cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				cwd: ''
			});

			await reader.next();

		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "cwd" recieves a non string value', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				cwd: 123
			});

			await reader.next();

		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "pattern" recieves a non string and non array value', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				pattern: 123
			});

			await reader.next();

		}, { message: `Expected 'string' or 'string[]', recieved 'number' at 'pattern' property.` });
	});

	it('should throw when "ignore" recieves a non string and non array value', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				ignore: 123
			});

			await reader.next();

		}, { message: `Expected 'string' or 'string[]', recieved 'number' at 'ignore' property.` });
	});

	it('should throw when "parse" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				parse: 123
			});

			await reader.next();

		}, { message: `Expected 'function', recieved 'number' at 'parse' property.` });
	});

	it('should throw when "catch" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				catch: 123
			});

			await reader.next();

		}, { message: `Expected 'function', recieved 'number' at 'catch' property.` });
	});

	it('should throw when "finally" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				backend: mockBackend,
				finally: 123
			});

			await reader.next();

		}, { message: `Expected 'function', recieved 'number' at 'finally' property.` });
	});
});
