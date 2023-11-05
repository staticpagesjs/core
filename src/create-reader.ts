import type { MaybePromise, Backend, Entry, ParsedEntry } from './helpers.js';
import { getType, isIterable, isAsyncIterable } from './helpers.js';
import picomatch from 'picomatch';

export namespace createReader {
	export type Options<T> = {
		backend?: Backend;
		cwd?: string;
		pattern?: string | string[];
		ignore?: string | string[];
		parse?(entry: Entry): MaybePromise<ParsedEntry<T>>;
		onError?(error: unknown): MaybePromise<void>;
	};
}

export async function* createReader<T>({
	backend,
	cwd = '.',
	pattern,
	ignore,
	parse = (entry) => JSON.parse(entry.content.toString()),
	onError = (error) => { throw error; },
}: createReader.Options<T>) {
	if (typeof backend !== 'object' || !backend || !('tree' in backend && 'read' in backend)) throw new TypeError(`Expected 'Backend' implementation at 'backend' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (typeof pattern !== 'undefined' && typeof pattern !== 'string' && Array.isArray(pattern)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(pattern)}' at 'pattern' property.`);
	if (typeof ignore !== 'undefined' && typeof ignore !== 'string' && Array.isArray(ignore)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(ignore)}' at 'ignore' property.`);
	if (typeof parse !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(parse)}' at 'parse' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	let entries = await backend.tree(cwd);

	if (!isIterable(entries) && !isAsyncIterable(entries))
		throw new TypeError('Argument type mismatch: return of \'backend.tree()\' expected to be an \'iterable\' or an \'asyncIterable\' type.');

	if (typeof pattern !== 'undefined' || typeof ignore !== 'undefined') {
		const filteredEntries = [];
		const isMatch = picomatch(pattern ?? '**/*', { cwd, ignore });
		for await (const entry of entries) {
			if (isMatch(entry)) {
				filteredEntries.push(entry);
			}
		}
		entries = filteredEntries;
	}

	for await (const entry of entries) {
		try {
			yield await parse({
				name: entry,
				content: await backend.read(entry),
			});
		} catch (error) {
			await onError(error);
		}
	}
}
