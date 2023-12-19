import assert from 'assert';
import staticPages from '../esm/index.js';

const mockBackend = { tree(){ return [1]; }, read(){ return 2; }, write(){} };

describe('Static Pages Throws Tests', () => {
	it('should throw when the route is not an object', async () => {
		await assert.rejects(async () => {
			await staticPages(null);
		}, { message: `Expected 'object', recieved 'null'.` });
	});

	it('should throw when "from" is not iterable', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: { [Symbol.asyncIterator]: 1 }, to: () => undefined });
		}, { message: `Expected 'Iterable' or 'AsyncIterable' at 'from' property.` });
	});

	it('should throw when "to" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: { a: 1 } });
		}, { message: `Expected 'function', recieved 'object' at 'to' property.` });
	});

	it('should throw when "controller" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: () => undefined, controller: 1 });
		}, { message: `Expected 'function', recieved 'number' at 'controller' property.` });
	});

	it('should throw when "from" and "to" are undefined', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: undefined, to: undefined });
		}, { message: `Expected 'Iterable' or 'AsyncIterable' at 'from' property.` });
	});

	it('should throw when "to.backend" recieves an an invalid type', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: 1,
					render: JSON.stringify
				}
			});
		}, { message: `Expected 'Backend' implementation at 'backend' property.` });
	});

	it('should throw when "to.cwd" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: mockBackend,
					render: JSON.stringify,
					cwd: 123
				}
			});
		}, { message: `Expected 'string', recieved 'number' at 'cwd' property.` });
	});

	it('should throw when "to.cwd" recieves an empty string', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: mockBackend,
					render: JSON.stringify,
					cwd: ''
				}
			});
		}, { message: `Expected non-empty string at 'cwd'.` });
	});

	it('should throw when "to.render" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: mockBackend,
					render: 123
				}
			});
		}, { message: `Expected 'function', recieved 'number' at 'render' property.` });
	});

	it('should throw when "to.name" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: mockBackend,
					render: JSON.stringify,
					name: 123
				}
			});
		}, { message: `Expected 'function', recieved 'number' at 'name' property.` });
	});

	it('should throw when "to.catch" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: mockBackend,
					render: JSON.stringify,
					catch: 123
				}
			});
		}, { message: `Expected 'function', recieved 'number' at 'catch' property.` });
	});

	it('should throw when "to.finally" recieves an invalid type', async () => {
		await assert.rejects(async () => {
			await staticPages({
				from: { backend: mockBackend },
				to: {
					backend: mockBackend,
					render: JSON.stringify,
					finally: 123
				}
			});
		}, { message: `Expected 'function', recieved 'number' at 'finally' property.` });
	});
});
