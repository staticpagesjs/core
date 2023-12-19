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
		catch?(error: unknown): MaybePromise<void>;
		finally?(): MaybePromise<void>;
	}
}

export async function* createReader<T>({
	backend,
	cwd = '.',
	pattern,
	ignore,
	parse = (content: Uint8Array | string) => JSON.parse(content.toString()),
	catch: catchCallback = (error: unknown) => { throw error; },
	finally: finallyCallback,
}: createReader.Options<T>) {
	if (!isBackend(backend)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof pattern !== 'undefined' && typeof pattern !== 'string' && !Array.isArray(pattern)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(pattern)}' at 'pattern' property.`);
	if (typeof ignore !== 'undefined' && typeof ignore !== 'string' && !Array.isArray(ignore)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(ignore)}' at 'ignore' property.`);
	if (typeof parse !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(parse)}' at 'parse' property.`);
	if (typeof catchCallback !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(catchCallback)}' at 'catch' property.`);
	if (typeof finallyCallback !== 'undefined' && typeof finallyCallback !== 'function')  throw new TypeError(`Expected 'function', recieved '${getType(finallyCallback)}' at 'finally' property.`);

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

	try {
		for await (const filename of filenames) {
			try {
				yield await parse(await backend.read(filename), filename);
			} catch (error) {
				await catchCallback(error);
			}
		}
	} finally {
		await finallyCallback?.();
	}
}

createReader.isOptions = <T>(x: unknown): x is createReader.Options<T> => {
	return !!x && typeof x === 'object' && 'backend' in x;
};
