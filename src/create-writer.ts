import type { MaybePromise, Backend } from './helpers.js';
import { isIterable, isAsyncIterable, isBackend } from './helpers.js';
import * as nodefsBackend from './nodefs-backend.js';

export namespace createWriter {
	export type Options<T> = {
		backend?: Backend;
		render?(data: T): MaybePromise<Uint8Array | string>;
		name?(data: T): MaybePromise<string>;
		catch?(error: unknown): MaybePromise<void>;
		finally?(): MaybePromise<void>;
	};
}

const defaultNamer = <T>(data: T) => {
	if (!!data && typeof data === 'object' && 'url' in data && typeof data.url === 'string') {
		return data.url.concat('.html');
	}
	return 'unnamed.html';
};

export function createWriter<T>({
	backend = nodefsBackend,
	render = (data: T) => JSON.stringify(data),
	name = defaultNamer,
	catch: catchCallback = (error: unknown) => { throw error; },
	finally: finallyCallback,
}: createWriter.Options<T> = {}) {
	if (!isBackend(backend)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);

	return async function (iterable: Iterable<T> | AsyncIterable<T>) {
		if (!isIterable(iterable) && !isAsyncIterable(iterable))
			throw new TypeError(`Expected 'Iterable' or 'AsyncIterable' at callback.`);

		try {
			for await (const data of iterable) {
				try {
					await backend.write(await name(data), await render(data));
				} catch (error) {
					await catchCallback(error);
				}
			}
		} finally {
			await finallyCallback?.();
		}
	};
}

createWriter.isOptions = <T>(x: unknown): x is createWriter.Options<T> => {
	return typeof x === 'undefined' || (!!x && typeof x === 'object' && 'backend' in x && 'render' in x);
};
