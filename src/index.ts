const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;
const isIterable = <T>(x: unknown extends Iterable<T> ? Iterable<T> : any): x is Iterable<T> => typeof x?.[Symbol.iterator] === 'function';
const isAsyncIterable = <T>(x: unknown extends Iterable<T> ? Iterable<T> : any): x is AsyncIterable<T> => typeof x?.[Symbol.asyncIterator] === 'function';

type Data = Record<string | symbol | number, unknown>;
type MaybePromise<T> = T | Promise<T>;

export namespace staticPages {
	export type Route<
		R extends Data = Data,
		W extends Data = Data
	> = {
		from: Iterable<R> | AsyncIterable<R>;
		to(data: AsyncIterable<W>): MaybePromise<void>;
		controller?(data: R): MaybePromise<undefined | W | Iterable<W> | AsyncIterable<W>>;
	};
}

export async function staticPages<
	R1 extends Data, W1 extends Data
>(...routes: [
	staticPages.Route<R1, W1>
]): Promise<void>;
export async function staticPages<
	R1 extends Data, W1 extends Data,
	R2 extends Data, W2 extends Data
>(...routes: [
	staticPages.Route<R1, W1>,
	staticPages.Route<R2, W2>
]): Promise<void>;
export async function staticPages<
	R1 extends Data, W1 extends Data,
	R2 extends Data, W2 extends Data,
	R3 extends Data, W3 extends Data
>(...routes: [
	staticPages.Route<R1, W1>,
	staticPages.Route<R2, W2>,
	staticPages.Route<R3, W3>
]): Promise<void>;
export async function staticPages<
	R1 extends Data, W1 extends Data,
	R2 extends Data, W2 extends Data,
	R3 extends Data, W3 extends Data,
	R4 extends Data, W4 extends Data
>(...routes: [
	staticPages.Route<R1, W1>,
	staticPages.Route<R2, W2>,
	staticPages.Route<R3, W3>,
	staticPages.Route<R4, W4>
]): Promise<void>;
export async function staticPages<
	R1 extends Data, W1 extends Data,
	R2 extends Data, W2 extends Data,
	R3 extends Data, W3 extends Data,
	R4 extends Data, W4 extends Data,
	R5 extends Data, W5 extends Data
>(...routes: [
	staticPages.Route<R1, W1>,
	staticPages.Route<R2, W2>,
	staticPages.Route<R3, W3>,
	staticPages.Route<R4, W4>,
	staticPages.Route<R5, W5>
]): Promise<void>;
export async function staticPages<
	R1 extends Data, W1 extends Data,
	R2 extends Data, W2 extends Data,
	R3 extends Data, W3 extends Data,
	R4 extends Data, W4 extends Data,
	R5 extends Data, W5 extends Data,
	R6 extends Data, W6 extends Data
>(...routes: [
	staticPages.Route<R1, W1>,
	staticPages.Route<R2, W2>,
	staticPages.Route<R3, W3>,
	staticPages.Route<R4, W4>,
	staticPages.Route<R5, W5>,
	staticPages.Route<R6, W6>
]): Promise<void>;
export async function staticPages(...routes: staticPages.Route[]): Promise<void>;

export async function staticPages(...routes: staticPages.Route[]): Promise<void> {
	for (const route of routes) {
		if (typeof route !== 'object' || !route)
			throw new Error(`Argument type mismatch: expected 'object', got '${getType(route)}'.`);

		const { from, to, controller } = route;

		if (!isIterable(from) && !isAsyncIterable(from))
			throw new Error('Argument type mismatch: \'from\' exptects \'iterable\' or \'asyncIterable\'.');

		if (typeof to !== 'function')
			throw new Error(`Argument type mismatch: 'to' expects 'function', got '${getType(to)}'.`);

		if (typeof controller !== 'undefined' && typeof controller !== 'function')
			throw new Error(`Argument type mismatch: 'controller' expects 'function', got '${getType(controller)}'.`);

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

export default staticPages;
