import type { MaybePromise, Filesystem } from './helpers.js';
import { getType, isIterable, isAsyncIterable, isFilesystem } from './helpers.js';
import { dirname } from 'node:path';
import * as nodeFs from 'node:fs';

export namespace createWriter {
	export interface Options<T> {
		fs?: Filesystem;
		cwd?: string;
		name?(data: T): MaybePromise<string>;
		render?(data: T): MaybePromise<Uint8Array | string>;
		onError?(error: unknown): MaybePromise<void>;
	}
}

const defaultNamer = <T>(data: T) => {
	if (!!data && typeof data === 'object' && 'url' in data && typeof data.url === 'string') {
		return data.url.concat('.html');
	}
	throw new Error(`Missing 'url' field in the document.`);
};

const defaultRenderer = <T>(data: T) => {
	if (!!data && typeof data === 'object' && 'content' in data && (
		typeof data.content === 'string' || data.content instanceof Uint8Array
	)) {
		return data.content;
	}
	throw new Error(`Missing 'content' field in the document.`);
};

export function createWriter<T>({
	fs = nodeFs,
	cwd = 'public',
	name = defaultNamer,
	render = defaultRenderer,
	onError = (error: unknown) => { throw error; },
}: createWriter.Options<T>) {
	if (!isFilesystem(fs)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);
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
				const filepath = cwd + '/' + await name(data);
				const dirpath = dirname(filepath);
				await new Promise((resolve, reject) => {
					fs.stat(dirpath, (err, stats) => {
						if (err) {
							fs.mkdir(dirpath, { recursive: true }, (err) => {
								if (err) {
									reject(err);
								} else {
									resolve(undefined);
								}
							});
						} else {
							resolve(undefined);
						}
					})
				});

				const content = await render(data);

				await new Promise((resolve, reject) => {
					fs.writeFile(filepath, content, (err) => {
						if (err) reject(err);
						else resolve(undefined);
					})
				});
			} catch (error) {
				await onError(error);
			}
		}
	};
}

createWriter.isOptions = <T>(x: unknown): x is createWriter.Options<T> => {
	return !!x && typeof x === 'object' && 'render' in x;
};
