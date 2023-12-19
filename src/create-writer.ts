import type { MaybePromise, Backend } from './helpers.js';
import { getType, isIterable, isAsyncIterable, isBackend } from './helpers.js';

export namespace createWriter {
	export interface Options<T> {
		backend: Backend;
		cwd?: string;
		render(data: T): MaybePromise<Uint8Array | string>;
		name?(data: T): MaybePromise<string>;
		catch?(error: unknown): MaybePromise<void>;
		finally?(): MaybePromise<void>;
	}
}

const defaultNamer = <T>(data: T) => {
	if (!!data && typeof data === 'object' && 'url' in data && typeof data.url === 'string') {
		return data.url.concat('.html');
	}
	return 'unnamed.html';
};

export function createWriter<T>({
	backend,
	cwd = '.',
	render,
	name = defaultNamer,
	catch: catchCallback = (error: unknown) => { throw error; },
	finally: finallyCallback,
}: createWriter.Options<T>) {
	if (!isBackend(backend)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof render !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(render)}' at 'render' property.`);
	if (typeof name !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(name)}' at 'name' property.`);
	if (typeof catchCallback !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(catchCallback)}' at 'catch' property.`);
	if (typeof finallyCallback !== 'undefined' && typeof finallyCallback !== 'function')  throw new TypeError(`Expected 'function', recieved '${getType(finallyCallback)}' at 'finally' property.`);

	return async function (iterable: Iterable<T> | AsyncIterable<T>) {
		if (!isIterable(iterable) && !isAsyncIterable(iterable))
			throw new TypeError(`Expected 'Iterable' or 'AsyncIterable' at callback.`);

		try {
			for await (const data of iterable) {
				try {
					await backend.write(cwd + '/' + await name(data), await render(data));
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
	return !!x && typeof x === 'object' && 'backend' in x && 'render' in x;
};
