import tap from 'tap';
import { staticPages } from '../esm/index.js';

tap.test('it should throw when the route is not an object', async (tap) => {
	await tap.rejects(staticPages(null), { message: 'Argument type mismatch' });
	tap.end();
});

tap.test('it shoult throw when "from" is not iterable', async (tap) => {
	await tap.rejects(staticPages({ from: 1, to: () => undefined }), { message: 'Argument type mismatch' });
	tap.end();
});

tap.test('it shoult throw when "to" is not a function', async (tap) => {
	await tap.rejects(staticPages({ from: [], to: { a: 1 } }), { message: 'Argument type mismatch' });
	tap.end();
});

tap.test('it shoult throw when "controller" is not a function', async (tap) => {
	await tap.rejects(staticPages({ from: [], to: () => undefined, controller: 1 }), { message: 'Argument type mismatch' });
	tap.end();
});

tap.test('it shoult throw when from and to is undefined', async (tap) => {
	await tap.rejects(staticPages({ from: undefined, to: undefined }), { message: 'Argument type mismatch' });
	tap.end();
});
