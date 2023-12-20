import picomatch from 'picomatch';
import type { MaybePromise, Backend } from './helpers.js';
import { getType, isIterable, isAsyncIterable, isBackend } from './helpers.js';

export namespace createReader {
	export interface Options<T> {
		backend: Backend;
		cwd?: string;
		pattern?: string | string[];
		ignore?: string | string[];
		parse?(content: Uint8Array | string, filename: string): MaybePromise<T>;
		onError?(error: unknown): MaybePromise<void>;
	}
}

export async function* createReader<T>({
	backend,
	cwd = '.',
	pattern,
	ignore,
	parse = (content: Uint8Array | string) => JSON.parse(content.toString()),
	onError = (error: unknown) => { throw error; },
}: createReader.Options<T>) {
	if (!isBackend(backend)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof pattern !== 'undefined' && typeof pattern !== 'string' && !Array.isArray(pattern)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(pattern)}' at 'pattern' property.`);
	if (typeof ignore !== 'undefined' && typeof ignore !== 'string' && !Array.isArray(ignore)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(ignore)}' at 'ignore' property.`);
	if (typeof parse !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(parse)}' at 'parse' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	let filenames = await backend.tree(cwd);

	if (!isIterable(filenames) && !isAsyncIterable(filenames))
		throw new TypeError(`Expected 'Iterable' or 'AsyncIterable' at 'backend.tree()' call.`);

	if (typeof pattern !== 'undefined' || typeof ignore !== 'undefined') {
		const filteredFilenames = [];
		const isMatch = picomatch(pattern ?? '**/*', { ignore });
		for await (const filename of filenames) {
			if (isMatch(filename)) {
				filteredFilenames.push(filename);
			}
		}
		filenames = filteredFilenames;
	}

	for await (const filename of filenames) {
		try {
			yield await parse(await backend.read(filename), filename);
		} catch (error) {
			await onError(error);
		}
	}
}

createReader.isOptions = <T>(x: unknown): x is createReader.Options<T> => {
	return !!x && typeof x === 'object' && 'backend' in x;
};
