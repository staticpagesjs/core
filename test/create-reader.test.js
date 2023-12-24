import assert from 'assert';
import { createReader } from '../esm/index.js';

import { createSequence } from './helpers/createSequence.cjs';
import { createMockFs } from './helpers/createMockFs.cjs';
import { createFileEntry } from './helpers/createFileEntry.cjs';

describe('Static Pages CreateReader Tests', () => {
	it('successfully reads with minimal configuration', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);
		const expected = createSequence(5)
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));

		const reader = createReader({
			fs: createMockFs(input),
		});

		const recieved = [];
		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can use pattern based filtering', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);
		const expected = createSequence(5)
			.filter(i => [0,2,4].includes(i))
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));

		const reader = createReader({
			fs: createMockFs(input),
			pattern: 'file-@(0|2|4).*'
		});

		const recieved = [];
		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can use ignore pattern based filtering', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);
		const expected = createSequence(5)
			.filter(i => [0,2,4].includes(i))
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));

		const reader = createReader({
			fs: createMockFs(input),
			ignore: 'file-@(1|3).*'
		});

		const recieved = [];
		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('should set url property from filename when url is not present in the content', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => [`pages/my/file-${i}.json`, `{"content":"content-${i}"}`])
		);
		const expected = createSequence(5)
			.map(i => ({
				url: `my/file-${i}`,
				content: `content-${i}`,
			}));

		const reader = createReader({
			fs: createMockFs(input),
		});

		const recieved = [];
		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can parse yaml files', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'yaml'))
		);
		const expected = createSequence(5)
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));

		const reader = createReader({
			fs: createMockFs(input),
		});

		const recieved = [];
		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can parse markdown files', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'md'))
		);
		const expected = createSequence(5)
			.map(i => ({
				url: `file-${i}`,
				content: `content-${i}`,
			}));

		const reader = createReader({
			fs: createMockFs(input),
		});

		const recieved = [];
		for await (const item of reader) {
			recieved.push(item);
		}

		assert.deepStrictEqual(recieved, expected);
	});

	it('can handle errors silently', async () => {
		const input = Object.fromEntries(
			createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
		);

		const expected = 'Some error thrown.';

		let recieved = null;
		const reader = createReader({
			fs: createMockFs(input),
			parse() { throw new Error(expected); },
			onError(error) {
				recieved = error.message;
			}
		});

		await reader.next();

		assert.deepStrictEqual(recieved, expected);
	});

	it('should throw with default settings on reading/parsing errors', async () => {
		await assert.rejects(async () => {
			const input = Object.fromEntries(
				createSequence(5)
					.map(i => createFileEntry(`file-${i}`, `content-${i}`, 'json'))
			);

			const reader = createReader({
				fs: createMockFs(input),
				parse() { throw new Error('Some error thrown.'); },
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});

	it('should throw when "backend" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: 1,
			});

			await reader.next();

		}, { message: `Expected Node FS compatible implementation at 'fs' property.` });
	});

	it('should throw when "cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({}),
				cwd: ''
			});

			await reader.next();

		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "cwd" recieves a non string value', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({}),
				cwd: 123
			});

			await reader.next();

		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "pattern" recieves a non string and non array value', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({}),
				pattern: 123
			});

			await reader.next();

		}, { message: `Expected 'string' or 'string[]', recieved 'number' at 'pattern' property.` });
	});

	it('should throw when "ignore" recieves a non string and non array value', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({}),
				ignore: 123
			});

			await reader.next();

		}, { message: `Expected 'string' or 'string[]', recieved 'number' at 'ignore' property.` });
	});

	it('should throw when "parse" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({}),
				parse: 123
			});

			await reader.next();

		}, { message: `Expected 'function', recieved 'number' at 'parse' property.` });
	});

	it('should throw when the default parser recieves a file without an extension', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({ 'pages/myfile': 'abc' }),
			});

			await reader.next();

		}, { message: `Could not parse document without an extension.` });
	});

	it('should throw when the default parser recieves an unknown file format', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({ 'pages/myfile.abc': 'abc' }),
			});

			await reader.next();

		}, { message: `Could not parse document with 'abc' extension.` });
	});

	it('should throw when "onError" recieves a non callable', async () => {
		await assert.rejects(async () => {
			const reader = createReader({
				fs: createMockFs({}),
				onError: 123
			});

			await reader.next();

		}, { message: `Expected 'function', recieved 'number' at 'onError' property.` });
	});

	it('should handle when the "fs.readdir" throws', async () => {
		await assert.rejects(async () => {
			const mockFs = createMockFs({});
			mockFs.readdir = function(dir, opts, cb) { cb(new Error('Some error thrown.')); };

			const reader = createReader({
				fs: mockFs,
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});

	it('should handle when the "fs.readFile" throws', async () => {
		await assert.rejects(async () => {
			const mockFs = createMockFs({ 'pages/file': 'content' });
			mockFs.readFile = function(file, cb) { cb(new Error('Some error thrown.')); };

			const reader = createReader({
				fs: mockFs,
			});

			await reader.next();

		}, { message: `Some error thrown.` });
	});
});
