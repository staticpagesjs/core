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
			await staticPages({ from: false, to: () => undefined });
		}, { message: `Expected 'Iterable' or 'AsyncIterable' at 'from' property.` });
	});

	it('should throw when "to" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: { backend: 1 } });
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
});
