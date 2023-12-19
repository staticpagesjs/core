import assert from 'assert';
import { createWriter } from '../esm/index.js';

const createMockBackend = () => {
	const impl = {
		tree(){ return ['1', '2']; },
		read(f){ return { '1': '"one"', '2': '"two"' }[f]; },
		write(f, c){ impl.output.push([f, c]); },
		output: [],
	};
	return impl;
};

describe('Static Pages CreateWriter Tests', () => {
	it('successfully writes with minimal configuration', async () => {
		const input = [{ url: 'one', body: '1' }, { url: 'two', body: '2' }];
		const expected = [
			['./one.html', '{"url":"one","body":"1"}'],
			['./two.html', '{"url":"two","body":"2"}']
		];

		const mockBackend = createMockBackend();
		const writer = createWriter({
			backend: mockBackend,
			render: JSON.stringify
		});

		await writer(input);

		assert.deepStrictEqual(mockBackend.output, expected);
	});

	it('when no url it names the output unnamed.html', async () => {
		const input = [{ body: '1' }];
		const expected = [
			['./unnamed.html', '{"body":"1"}']
		];

		const mockBackend = createMockBackend();
		const writer = createWriter({
			backend: mockBackend,
			render: JSON.stringify
		});

		await writer(input);

		assert.deepStrictEqual(mockBackend.output, expected);
	});

	it('calls finally when done', async () => {
		const input = [{ url: 'one', body: '1' }, { url: 'two', body: '2' }];
		const expected = [
			['./one.html', '{"url":"one","body":"1"}'],
			['./two.html', '{"url":"two","body":"2"}'],
			'finally'
		];

		const mockBackend = createMockBackend();
		const writer = createWriter({
			backend: mockBackend,
			render: JSON.stringify,
			finally() {
				mockBackend.output.push('finally');
			}
		});

		await writer(input);

		assert.deepStrictEqual(mockBackend.output, expected);
	});

	it('can handle errors', async () => {
		const expected = 'Some error thrown.';
		let actual = null;
		const input = [{ body: '1' }];
		const writer = createWriter({
			backend: createMockBackend(),
			render() { throw new Error('Some error thrown.'); },
			catch(error) { actual = error.message; }
		});
		await writer(input);
		assert.deepStrictEqual(actual, expected);
	});

	it('should throw on error with default configuration', async () => {
		await assert.rejects(async () => {
			const input = [{ body: '1' }];
			const writer = createWriter({
				backend: createMockBackend(),
				render() { throw new Error('Some error thrown.'); },
			});
			await writer(input);
		}, { message: `Some error thrown.` });
	});

	it('should throw when "backend" recieves an an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: 1,
				render: JSON.stringify
			});
		}, { message: `Expected 'Backend' implementation at 'backend' property.` });
	});

	it('should throw when "to.cwd" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: createMockBackend(),
				render: JSON.stringify,
				cwd: 123
			});
		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: createMockBackend(),
				render: JSON.stringify,
				cwd: ''
			});
		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "render" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: createMockBackend(),
				render: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'render' property.` });
	});

	it('should throw when "name" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: createMockBackend(),
				render: JSON.stringify,
				name: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'name' property.` });
	});

	it('should throw when "catch" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: createMockBackend(),
				render: JSON.stringify,
				catch: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'catch' property.` });
	});

	it('should throw when "finally" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				backend: createMockBackend(),
				render: JSON.stringify,
				finally: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'finally' property.` });
	});

	it('should throw when invalid type recieved as callback parameter', async () => {
		await assert.rejects(async () => {
			const writer = createWriter({
				backend: createMockBackend(),
				render: JSON.stringify
			});
			await writer(1);
		}, { message: `Expected 'Iterable' or 'AsyncIterable' at callback.` });
	});
});
