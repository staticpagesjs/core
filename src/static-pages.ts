import type { MaybePromise } from './helpers.js';
import { getType, isIterable, isAsyncIterable } from './helpers.js';
import { createReader } from './create-reader.js';
import { createWriter } from './create-writer.js';

export namespace staticPages {
	export type Route<F, T> = {
		from: Iterable<F> | AsyncIterable<F> | createReader.Options<F>;
		to: { (data: AsyncIterable<T>): MaybePromise<void>; } | createWriter.Options<T>;
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
			throw new TypeError(`Expected 'object', recieved '${getType(route)}'.`);

		let { from, to, controller } = route;

		if (createReader.isOptions(from)) from = createReader(from);
		if (createWriter.isOptions(to)) to = createWriter(to);

		if (!isIterable(from) && !isAsyncIterable(from))
			throw new TypeError(`Expected 'Iterable' or 'AsyncIterable' at 'from' property.`);

		if (typeof to !== 'function')
			throw new TypeError(`Expected 'function', recieved '${getType(to)}' at 'to' property.`);

		if (typeof controller !== 'undefined' && typeof controller !== 'function')
			throw new TypeError(`Expected 'function', recieved '${getType(controller)}' at 'controller' property.`);

		await to(asyncGenerator(from, controller));
	}
}

async function* asyncGenerator<F, T>(items: Iterable<F> | AsyncIterable<F>, controller?: { (data: F): MaybePromise<undefined | T | Iterable<T> | AsyncIterable<T>>; }) {
	for await (const item of items) {
		const data = controller ? await controller(item) : item;
		if (isIterable(data) || isAsyncIterable(data)) {
			yield* data;
		} else if (typeof data !== 'undefined') {
			yield data;
		}
	}
}

staticPages.with = ({ from, to, controller }: Partial<staticPages.Route<unknown, unknown>>): { (...routes: Partial<staticPages.Route<unknown, unknown>>[]): Promise<void>; } => {
	const fromIsPlainObject = from && typeof from === 'object' && !isIterable(from) && !isAsyncIterable(from);
	const toIsPlainObject = to && typeof to === 'object';
	return (...routes: Partial<staticPages.Route<unknown, unknown>>[]): Promise<void> => {
		return staticPages(...routes.map(x => ({
			from: fromIsPlainObject && x.from && typeof x.from === 'object' && !isIterable(x.from) && !isAsyncIterable(x.from) ? { ...from, ...x.from } : (x.from ? x.from : from),
			to: toIsPlainObject && x.to && typeof x.to === 'object' ? { ...to, ...x.to } : (x.to ? x.to : to),
			controller: x.controller ?? controller,
		}) as staticPages.Route<unknown, unknown>)); // Assume users knows what they do and all options are provided. Assert fails later anyways if not.
	};
};
