import { isIterable, isAsyncIterable } from './helpers.js';

type MaybePromise<T> = T | Promise<T>;

export namespace createWriter {
	export type Options<T> = {
		render(data: Readonly<T>): MaybePromise<string | ArrayBufferView | undefined>;
		name(data: Readonly<T>): MaybePromise<string>;
		write(name: string, data: string | ArrayBufferView | undefined): MaybePromise<void>;
		finally?(): MaybePromise<void>;
		onError?(error: unknown): MaybePromise<void>;
	};
}

export function createWriter<T>(options: createWriter.Options<T>) {
	const { render, name, write, onError = (error) => { throw error; } } = options;

	return async function (iterable: Iterable<T> | AsyncIterable<T>) {
		if (!isIterable(iterable) && !isAsyncIterable(iterable))
			throw new Error('Argument type mismatch: expected an \'iterable\' or an \'asyncIterable\' type.');

		try {
			for await (const entry of iterable) {
				try {
					await write(await name(entry), await render(entry));
				} catch (error) {
					await onError(error);
				}
			}
		} finally {
			await options.finally?.();
		}
	};
}
