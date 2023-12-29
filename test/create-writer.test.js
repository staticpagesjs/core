import assert from 'assert';
import { createWriter } from '../esm/index.js';

import { createSequence } from './helpers/createSequence.cjs';
import { createMockFs } from './helpers/createMockFs.cjs';
import { createFileEntry } from './helpers/createFileEntry.cjs';

describe('Static Pages CreateWriter Tests', () => {
	it('successfully writes with minimal configuration', async () => {
		const input = createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`))
				.map(([k, v]) => v);
		const expected = Object.fromEntries(
			createSequence(5)
				.map(i => [`public/file-${i}.html`, `content-${i}`])
		);
		const output = {};
		const mockFs = createMockFs({}, output);

		const writer = createWriter({
			fs: mockFs,
		});

		for await (const item of input) {
			await writer(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('should throw when url field is missing', async () => {
		await assert.rejects(async () => {
			const input = createSequence(5)
				.map(i => {
					const ent = createFileEntry(`file-${i}`, `content-${i}`);
					delete ent[1].url;
					return ent;
				})
				.map(([k, v]) => v);
			const output = {};
			const mockFs = createMockFs({}, output);

			const writer = createWriter({
				fs: mockFs,
			});

			for await (const item of input) {
				await writer(item);
			}

		}, { message: `Missing 'url' field in the document.` });
	});

	it('should throw when content field is missing', async () => {
		await assert.rejects(async () => {
			const input = createSequence(5)
				.map(i => {
					const ent = createFileEntry(`file-${i}`, `content-${i}`);
					delete ent[1].content;
					return ent;
				})
				.map(([k, v]) => v);
			const output = {};
			const mockFs = createMockFs({}, output);

			const writer = createWriter({
				fs: mockFs,
			});

			for await (const item of input) {
				await writer(item);
			}

		}, { message: `Missing 'content' field in the document.` });
	});

	it('can handle errors silently', async () => {
		const input = createSequence(5)
			.map(i => createFileEntry(`file-${i}`, `content-${i}`))
			.map(([k, v]) => v);

		const expected = 'Some error thrown.';
		let output = null;
		const writer = createWriter({
			fs: createMockFs({}),
			render() { throw new Error('Some error thrown.'); },
			onError(error) { output = error.message; }
		});

		for await (const item of input) {
			await writer(item);
		}

		assert.deepStrictEqual(output, expected);
	});

	it('should throw on error with default configuration', async () => {
		await assert.rejects(async () => {
			const input = createSequence(5)
				.map(i => createFileEntry(`file-${i}`, `content-${i}`))
				.map(([k, v]) => v);

			const writer = createWriter({
				fs: createMockFs({}),
				render() { throw new Error('Some error thrown.'); },
			});

			for await (const item of input) {
				await writer(item);
			}

		}, { message: `Some error thrown.` });
	});

	it('should throw when "fs" recieves an an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				fs: 1,
			});
		}, { message: `Expected Node FS compatible implementation at 'fs' property.` });
	});

	it('should throw when "cwd" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				fs: createMockFs({}),
				cwd: 123
			});
		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			createWriter({
				fs: createMockFs({}),
				cwd: ''
			});
		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "render" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				fs: createMockFs({}),
				render: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'render' property.` });
	});

	it('should throw when "name" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				fs: createMockFs({}),
				name: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'name' property.` });
	});

	it('should throw when "onError" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			createWriter({
				fs: createMockFs({}),
				onError: 123
			});
		}, { message: `Expected 'function', recieved 'number' at 'onError' property.` });
	});

	it('should handle mkdir errors', async () => {
		await assert.rejects(async () => {
			const input = createSequence(5)
					.map(i => createFileEntry(`file-${i}`, `content-${i}`))
					.map(([k, v]) => v);
			const expected = Object.fromEntries(
				createSequence(5)
					.map(i => [`public/file-${i}.html`, `content-${i}`])
			);
			const output = {};
			const mockFs = createMockFs({}, output);
			mockFs.mkdir = function (file, opts, cb) { cb(new Error('Some error thrown')); };

			const writer = createWriter({
				fs: mockFs,
			});

			for await (const item of input) {
				await writer(item);
			}

		}, { message: `Some error thrown` });
	});

	it('should handle writeFile errors', async () => {
		await assert.rejects(async () => {
			const input = createSequence(5)
					.map(i => createFileEntry(`file-${i}`, `content-${i}`))
					.map(([k, v]) => v);
			const expected = Object.fromEntries(
				createSequence(5)
					.map(i => [`public/file-${i}.html`, `content-${i}`])
			);
			const output = {};
			const mockFs = createMockFs({}, output);
			mockFs.writeFile = function (file, data, cb) { cb(new Error('Some error thrown')); };

			const writer = createWriter({
				fs: mockFs,
			});

			for await (const item of input) {
				await writer(item);
			}

		}, { message: `Some error thrown` });
	});
});
