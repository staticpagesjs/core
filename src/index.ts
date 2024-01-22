const isIterable = <T>(x: unknown): x is Iterable<T> => !!x && typeof x === 'object' && Symbol.iterator in x && typeof x[Symbol.iterator] === 'function';
const isAsyncIterable = <T>(x: unknown): x is AsyncIterable<T> => !!x && typeof x === 'object' && Symbol.asyncIterator in x && typeof x[Symbol.asyncIterator] === 'function';
const getType = (x: unknown): string => typeof x === 'object' ? (x ? (Array.isArray(x) ? 'array' : 'object') : 'null') : typeof x;

export interface Route<F = unknown, T = unknown> {
	from: Iterable<F> | AsyncIterable<F>;
	to(data: T): void | Promise<void>;
	controller?(data: F): undefined | T | Iterable<T> | AsyncIterable<T> | Promise<undefined | T | Iterable<T> | AsyncIterable<T>>;
}

export async function staticPages<F1, T1>(...route: [Route<F1, T1>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2>(...route: [Route<F1, T1>, Route<F2, T2>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>, Route<F5, T5>]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5, F6, T6>(...route: [Route<F1, T1>, Route<F2, T2>, Route<F3, T3>, Route<F4, T4>, Route<F5, T5>, Route<F6, T6>]): Promise<void>;
export async function staticPages(...routes: Route[]): Promise<void>;

export async function staticPages(...routes: Route[]): Promise<void> {
	for (const route of routes) {
		if (typeof route !== 'object' || !route)
			throw new TypeError(`Expected 'object', recieved '${getType(route)}'.`);

		const { from, to, controller } = route;

		if (!isIterable(from) && !isAsyncIterable(from))
			throw new TypeError('Expected \'Iterable\' or \'AsyncIterable\' at \'from\' property.');

		if (typeof to !== 'function')
			throw new TypeError(`Expected 'function', recieved '${getType(to)}' at 'to' property.`);

		if (typeof controller !== 'undefined' && typeof controller !== 'function')
			throw new TypeError(`Expected 'function', recieved '${getType(controller)}' at 'controller' property.`);

		for await (const item of from) {
			const data = controller ? await controller(item) : item;
			if (isIterable(data) || isAsyncIterable(data)) {
				for await (const item of data) {
					await to(item);
				}
			} else if (typeof data !== 'undefined') {
				await to(data);
			}
		}
	}
}

export default staticPages;
