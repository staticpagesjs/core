import type { Data, MaybePromise } from './common.js';
import { isIterable, isAsyncIterable } from './common.js';

export namespace createWriter {
	export type Options<T extends Data> = {
		render(data: Readonly<T>): MaybePromise<string | NodeJS.ArrayBufferView | undefined>;
		write(data: string | NodeJS.ArrayBufferView | undefined): MaybePromise<void>;
		finally?(): void;
		onError?(error: unknown): void;
	};
}

export function createWriter<T extends Data>(options: createWriter.Options<T>) {
	const { render, write, onError = (error) => { throw error; } } = options;

	return async function (iterable: Iterable<T> | AsyncIterable<T>) {
		if (!isIterable(iterable) && !isAsyncIterable(iterable))
			throw new Error('Argument type mismatch: expected an \'iterable\' or an \'asyncIterable\' type.');

		try {
			for await (const entry of iterable) {
				try {
					await write(await render(entry));
				} catch (error) {
					onError(error);
				}
			}
		} finally {
			options.finally?.();
		}
	};
}
