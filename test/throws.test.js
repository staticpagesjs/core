import assert from 'node:assert';
import staticPages from '../index.js';

describe('Static Pages Throws Tests', () => {
	it('should throw when the route is not an object', async () => {
		await assert.rejects(async () => {
			await staticPages(null);
		}, { message: `Expected 'object', recieved 'null'.` });
	});

	it('should throw when "from" is not iterable', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: true, to: () => undefined });
		}, { message: `Expected 'Iterable' or 'AsyncIterable' at 'from' property.` });
	});

	it('should throw when "to" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: {} });
		}, { message: `Expected 'function', recieved 'object' at 'to' property.` });
	});

	it('should throw when "controller" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: () => undefined, controller: [] });
		}, { message: `Expected 'function', recieved 'array' at 'controller' property.` });
	});

	it('should throw when "controller" is not a function #2', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: () => undefined, controller: 123 });
		}, { message: `Expected 'function', recieved 'number' at 'controller' property.` });
	});
});
