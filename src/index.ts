const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;
const isIterable = <T>(x: any): x is Iterable<T> => typeof x?.[Symbol.iterator] === 'function';
const isAsyncIterable = <T>(x: any): x is AsyncIterable<T> => typeof x?.[Symbol.asyncIterator] === 'function';

export namespace staticPages {
	export type Route<
		R extends Record<string, unknown> = Record<string, unknown>,
		W extends Record<string, unknown> = Record<string, unknown>
		> = {
			from: Iterable<R> | AsyncIterable<R>;
			to: { (data: W): void | Promise<void>; teardown?(): void | Promise<void>; };
			controller?(data: R): void | W | W[] | Promise<void | W | W[]>;
		};
}

export async function staticPages<R1 extends Record<string, unknown> = Record<string, unknown>, W1 extends Record<string, unknown> = Record<string, unknown>>(...routes: [staticPages.Route<R1, W1>]): Promise<void>;
export async function staticPages<R1 extends Record<string, unknown> = Record<string, unknown>, W1 extends Record<string, unknown> = Record<string, unknown>, R2 extends Record<string, unknown> = Record<string, unknown>, W2 extends Record<string, unknown> = Record<string, unknown>>(...routes: [staticPages.Route<R1, W1>, staticPages.Route<R2, W2>]): Promise<void>;
export async function staticPages<R1 extends Record<string, unknown> = Record<string, unknown>, W1 extends Record<string, unknown> = Record<string, unknown>, R2 extends Record<string, unknown> = Record<string, unknown>, W2 extends Record<string, unknown> = Record<string, unknown>, R3 extends Record<string, unknown> = Record<string, unknown>, W3 extends Record<string, unknown> = Record<string, unknown>>(...routes: [staticPages.Route<R1, W1>, staticPages.Route<R2, W2>, staticPages.Route<R3, W3>]): Promise<void>;
export async function staticPages<R1 extends Record<string, unknown> = Record<string, unknown>, W1 extends Record<string, unknown> = Record<string, unknown>, R2 extends Record<string, unknown> = Record<string, unknown>, W2 extends Record<string, unknown> = Record<string, unknown>, R3 extends Record<string, unknown> = Record<string, unknown>, W3 extends Record<string, unknown> = Record<string, unknown>, R4 extends Record<string, unknown> = Record<string, unknown>, W4 extends Record<string, unknown> = Record<string, unknown>>(...routes: [staticPages.Route<R1, W1>, staticPages.Route<R2, W2>, staticPages.Route<R3, W3>, staticPages.Route<R4, W4>]): Promise<void>;
export async function staticPages<R1 extends Record<string, unknown> = Record<string, unknown>, W1 extends Record<string, unknown> = Record<string, unknown>, R2 extends Record<string, unknown> = Record<string, unknown>, W2 extends Record<string, unknown> = Record<string, unknown>, R3 extends Record<string, unknown> = Record<string, unknown>, W3 extends Record<string, unknown> = Record<string, unknown>, R4 extends Record<string, unknown> = Record<string, unknown>, W4 extends Record<string, unknown> = Record<string, unknown>, R5 extends Record<string, unknown> = Record<string, unknown>, W5 extends Record<string, unknown> = Record<string, unknown>>(...routes: [staticPages.Route<R1, W1>, staticPages.Route<R2, W2>, staticPages.Route<R3, W3>, staticPages.Route<R4, W4>, staticPages.Route<R5, W5>]): Promise<void>;
export async function staticPages<R1 extends Record<string, unknown> = Record<string, unknown>, W1 extends Record<string, unknown> = Record<string, unknown>, R2 extends Record<string, unknown> = Record<string, unknown>, W2 extends Record<string, unknown> = Record<string, unknown>, R3 extends Record<string, unknown> = Record<string, unknown>, W3 extends Record<string, unknown> = Record<string, unknown>, R4 extends Record<string, unknown> = Record<string, unknown>, W4 extends Record<string, unknown> = Record<string, unknown>, R5 extends Record<string, unknown> = Record<string, unknown>, W5 extends Record<string, unknown> = Record<string, unknown>, R6 extends Record<string, unknown> = Record<string, unknown>, W6 extends Record<string, unknown> = Record<string, unknown>>(...routes: [staticPages.Route<R1, W1>, staticPages.Route<R2, W2>, staticPages.Route<R3, W3>, staticPages.Route<R4, W4>, staticPages.Route<R5, W5>, staticPages.Route<R6, W6>]): Promise<void>;
export async function staticPages(...routes: staticPages.Route[]): Promise<void>;

export async function staticPages(...routes: staticPages.Route[]): Promise<void> {
	const teardown = new Set<{ (): void | Promise<void>; }>();

	for (const route of routes) {
		if (typeof route !== 'object' || !route)
			throw new Error(`Argument type mismatch, expected 'object', got '${getType(route)}'.`);

		const { from, to, controller } = route;

		if (!isIterable(from) && !isAsyncIterable(from))
			throw new Error('Argument type mismatch, \'from\' exptects \'iterable\' or \'asyncIterable\'.');

		if (typeof to !== 'function')
			throw new Error(`Argument type mismatch, 'to' expects 'function', got '${getType(to)}'.`);

		if (typeof controller !== 'undefined' && typeof controller !== 'function')
			throw new Error(`Argument type mismatch, 'controller' expects 'function', got '${getType(controller)}'.`);

		if (typeof to.teardown === 'function') {
			teardown.add(to.teardown);
		}

		const isController = typeof controller === 'function';

		for await (const data of from) {
			const results = isController ? await controller(data) : data;
			if (typeof results === 'object' && results) {
				if (Array.isArray(results)) {
					for (const result of results) {
						await to(result);
					}
				} else {
					await to(results);
				}
			}
		}
	}

	for (const fn of teardown) {
		await fn();
	}
}

export default staticPages;
