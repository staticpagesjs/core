import assert from 'assert';
import { createWriter } from '../esm/index.js';

import { createMockFs } from './helpers/createMockFs.cjs';
import { createFileEntry } from './helpers/createFileEntry.cjs';

const mockFs = createMockFs(Object.fromEntries([createFileEntry('some/file1', 'one')]));

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
	// it('successfully writes with minimal configuration', async () => {
	// 	const input = [{ url: 'one', body: '1' }, { url: 'two', body: '2' }];
	// 	const expected = [
	// 		['./one.html', '{"url":"one","body":"1"}'],
	// 		['./two.html', '{"url":"two","body":"2"}']
	// 	];

	// 	const mockBackend = createMockBackend();
	// 	const writer = createWriter({
	// 		fs: mockBackend,
	// 		render: JSON.stringify
	// 	});

	// 	await writer(input);

	// 	assert.deepStrictEqual(mockBackend.output, expected);
	// });

	// it('when no url it names the output unnamed.html', async () => {
	// 	const input = [{ body: '1' }];
	// 	const expected = [
	// 		['./unnamed.html', '{"body":"1"}']
	// 	];

	// 	const mockBackend = createMockBackend();
	// 	const writer = createWriter({
	// 		fs: mockBackend,
	// 		render: JSON.stringify
	// 	});

	// 	await writer(input);

	// 	assert.deepStrictEqual(mockBackend.output, expected);
	// });

	// it('can handle errors', async () => {
	// 	const expected = 'Some error thrown.';
	// 	let actual = null;
	// 	const input = [{ body: '1' }];
	// 	const writer = createWriter({
	// 		fs: createMockBackend(),
	// 		render() { throw new Error('Some error thrown.'); },
	// 		onError(error) { actual = error.message; }
	// 	});
	// 	await writer(input);
	// 	assert.deepStrictEqual(actual, expected);
	// });

	// it('should throw on error with default configuration', async () => {
	// 	await assert.rejects(async () => {
	// 		const input = [{ body: '1' }];
	// 		const writer = createWriter({
	// 			fs: createMockBackend(),
	// 			render() { throw new Error('Some error thrown.'); },
	// 		});
	// 		await writer(input);
	// 	}, { message: `Some error thrown.` });
	// });

	// it('should throw when "backend" recieves an an invalid type', async () => {
	// 	await assert.rejects(async () => {
	// 		createWriter({
	// 			fs: 1,
	// 			render: JSON.stringify
	// 		});
	// 	}, { message: `Expected 'Backend' implementation at 'backend' property.` });
	// });

	// it('should throw when "cwd" recieves an invalid type', async () => {
	// 	await assert.rejects(async () => {
	// 		createWriter({
	// 			fs: createMockBackend(),
	// 			render: JSON.stringify,
	// 			cwd: 123
	// 		});
	// 	}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	// });

	// it('should throw when "cwd" recieves an empty string', async () => {
	// 	await assert.rejects(async () => {
	// 		createWriter({
	// 			fs: createMockBackend(),
	// 			render: JSON.stringify,
	// 			cwd: ''
	// 		});
	// 	}, { message: `Expected non-empty string at 'cwd'.` });
	// });

	// it('should throw when "render" recieves an invalid type', async () => {
	// 	await assert.rejects(async () => {
	// 		createWriter({
	// 			fs: createMockBackend(),
	// 			render: 123
	// 		});
	// 	}, { message: `Expected 'function', recieved 'number' at 'render' property.` });
	// });

	// it('should throw when "name" recieves an invalid type', async () => {
	// 	await assert.rejects(async () => {
	// 		createWriter({
	// 			fs: createMockBackend(),
	// 			render: JSON.stringify,
	// 			name: 123
	// 		});
	// 	}, { message: `Expected 'function', recieved 'number' at 'name' property.` });
	// });

	// it('should throw when "onError" recieves an invalid type', async () => {
	// 	await assert.rejects(async () => {
	// 		createWriter({
	// 			fs: createMockBackend(),
	// 			render: JSON.stringify,
	// 			onError: 123
	// 		});
	// 	}, { message: `Expected 'function', recieved 'number' at 'onError' property.` });
	// });

	// it('should throw when invalid type recieved as callback parameter', async () => {
	// 	await assert.rejects(async () => {
	// 		const writer = createWriter({
	// 			fs: createMockBackend(),
	// 			render: JSON.stringify
	// 		});
	// 		await writer(1);
	// 	}, { message: `Expected 'Iterable' or 'AsyncIterable' at callback.` });
	// });
});
