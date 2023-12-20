import type { MaybePromise } from './helpers.js';
import { getType, isIterable, isAsyncIterable } from './helpers.js';
import { createReader } from './create-reader.js';
import { createWriter } from './create-writer.js';

export namespace staticPages {
	export interface Route<F = unknown, T = unknown> {
		from: Iterable<F> | AsyncIterable<F> | createReader.Options<F>;
		to: { (data: AsyncIterable<T>): MaybePromise<void>; } | createWriter.Options<T>;
		controller?(data: F): MaybePromise<undefined | T | Iterable<T> | AsyncIterable<T>>;
	}
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
export async function staticPages(...routes: staticPages.Route[]): Promise<void>;

export async function staticPages(...routes: staticPages.Route[]): Promise<void> {
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

type NullablePartialRoute = {
	[P in keyof staticPages.Route]?: null | staticPages.Route[P];
};

staticPages.with = ({ from, to, controller }: NullablePartialRoute): typeof staticPages => {
	const withFunction = (newValue: NullablePartialRoute) =>
		staticPages.with({
			from: determineFrom(from, newValue.from)!,
			to: determineTo(to, newValue.to)!,
			controller: typeof newValue.controller !== 'undefined' ? newValue.controller : controller,
		});

	function modifiedStaticPages(...routes: NullablePartialRoute[]): Promise<void> {
		return staticPages(...routes.map(route => ({
			from: determineFrom(from, route.from)!,
			to: determineTo(to, route.to)!,
			controller: (typeof route.controller !== 'undefined' ? route.controller : controller)! ?? undefined,
		})));
	}

	modifiedStaticPages.with = withFunction;
	return modifiedStaticPages;
};

function determineFrom(oldValue?: NullablePartialRoute['from'], newValue?: NullablePartialRoute['from']) {
	if (newValue && typeof newValue === 'object' && !isIterable(newValue) && !isAsyncIterable(newValue) &&
		oldValue && typeof oldValue === 'object' && !isIterable(oldValue) && !isAsyncIterable(oldValue)
	) return { ...oldValue, ...newValue };

	return typeof newValue !== 'undefined' ? newValue : oldValue;
}

function determineTo(oldValue?: NullablePartialRoute['to'], newValue?: NullablePartialRoute['to']) {
	if (newValue && typeof newValue === 'object' &&
		oldValue && typeof oldValue === 'object'
	) return { ...oldValue, ...newValue };

	return typeof newValue !== 'undefined' ? newValue : oldValue;
}
