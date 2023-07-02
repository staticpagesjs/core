import assert from 'assert';
import staticPages from '../esm/index.js';

describe('Static Pages Throws Tests', () => {
	it('should throw when the route is not an object', async () => {
		await assert.rejects(async () => {
			await staticPages(null);
		}, { message: `Argument type mismatch: expected 'object', got 'null'.` });
	});

	it('should throw when "from" is not iterable', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: 1, to: () => undefined });
		}, { message: `Argument type mismatch: 'from' exptects 'iterable' or 'asyncIterable'.` });
	});

	it('should throw when "to" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: { a: 1 } });
		}, { message: `Argument type mismatch: 'to' expects 'function', got 'object'.` });
	});

	it('should throw when "controller" is not a function', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: [], to: () => undefined, controller: 1 });
		}, { message: `Argument type mismatch: 'controller' expects 'function', got 'number'.` });
	});

	it('should throw when from and to are undefined', async () => {
		await assert.rejects(async () => {
			await staticPages({ from: undefined, to: undefined });
		}, { message: `Argument type mismatch: 'from' exptects 'iterable' or 'asyncIterable'.` });
	});
});
