import { getType, isIterable, isAsyncIterable } from './helpers.js';

type MaybePromise<T> = T | Promise<T>;

export namespace staticPages {
	export type Route<F, T> = {
		from: Iterable<F> | AsyncIterable<F>;
		to(data: AsyncIterable<T>): MaybePromise<void>;
		controller?(data: F): MaybePromise<undefined | T | Iterable<T> | AsyncIterable<T>>;
	};
}

export async function staticPages<F1, T1>(...route: [
	staticPages.Route<F1, T1>
]): Promise<void>;
export async function staticPages<F1, T1, F2, T2>(...route: [
	staticPages.Route<F1, T1>,
	staticPages.Route<F2, T2>
]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3>(...route: [
	staticPages.Route<F1, T1>,
	staticPages.Route<F2, T2>,
	staticPages.Route<F3, T3>
]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4>(...route: [
	staticPages.Route<F1, T1>,
	staticPages.Route<F2, T2>,
	staticPages.Route<F3, T3>,
	staticPages.Route<F4, T4>
]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5>(...route: [
	staticPages.Route<F1, T1>,
	staticPages.Route<F2, T2>,
	staticPages.Route<F3, T3>,
	staticPages.Route<F4, T4>,
	staticPages.Route<F5, T5>
]): Promise<void>;
export async function staticPages<F1, T1, F2, T2, F3, T3, F4, T4, F5, T5, F6, T6>(...route: [
	staticPages.Route<F1, T1>,
	staticPages.Route<F2, T2>,
	staticPages.Route<F3, T3>,
	staticPages.Route<F4, T4>,
	staticPages.Route<F5, T5>,
	staticPages.Route<F6, T6>
]): Promise<void>;
export async function staticPages(...routes: staticPages.Route<unknown, unknown>[]): Promise<void>;

export async function staticPages(...routes: staticPages.Route<unknown, unknown>[]): Promise<void> {
	for (const route of routes) {
		if (typeof route !== 'object' || !route)
			throw new Error(`Argument type mismatch: expected an 'object' type, got '${getType(route)}'.`);

		const { from, to, controller } = route;

		if (!isIterable(from) && !isAsyncIterable(from))
			throw new Error('Argument type mismatch: \'from\' expects an \'iterable\' or an \'asyncIterable\' type.');

		if (typeof to !== 'function')
			throw new Error(`Argument type mismatch: 'to' expects a 'function' type, got '${getType(to)}'.`);

		if (typeof controller !== 'undefined' && typeof controller !== 'function')
			throw new Error(`Argument type mismatch: 'controller' expects a 'function' type, got '${getType(controller)}'.`);

		async function* asyncGenerator() {
			for await (const item of from) {
				const data = controller ? await controller(item) : item;
				if (isIterable(data) || isAsyncIterable(data)) {
					yield* data;
				} else if (typeof data !== 'undefined') {
					yield data;
				}
			}
		}

		await to(asyncGenerator());
	}
}
