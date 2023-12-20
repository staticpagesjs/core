import type { MaybePromise, Backend } from './helpers.js';
import { getType, isIterable, isAsyncIterable, isBackend } from './helpers.js';

export namespace createWriter {
	export interface Options<T> {
		backend: Backend;
		cwd?: string;
		render(data: T): MaybePromise<Uint8Array | string>;
		name?(data: T): MaybePromise<string>;
		onError?(error: unknown): MaybePromise<void>;
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
	onError = (error: unknown) => { throw error; },
}: createWriter.Options<T>) {
	if (!isBackend(backend)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof render !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(render)}' at 'render' property.`);
	if (typeof name !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(name)}' at 'name' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	return async function (iterable: Iterable<T> | AsyncIterable<T>) {
		if (!isIterable(iterable) && !isAsyncIterable(iterable))
			throw new TypeError(`Expected 'Iterable' or 'AsyncIterable' at callback.`);

		for await (const data of iterable) {
			try {
				await backend.write(cwd + '/' + await name(data), await render(data));
			} catch (error) {
				await onError(error);
			}
		}
	};
}

createWriter.isOptions = <T>(x: unknown): x is createWriter.Options<T> => {
	return !!x && typeof x === 'object' && 'backend' in x && 'render' in x;
};
