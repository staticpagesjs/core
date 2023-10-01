import type { Data, MaybePromise } from './common.js';
import { isIterable, isAsyncIterable } from './common.js';

export namespace createReader {
	export type ReadResult = Uint8Array | string;
	export type Options<T extends Data> = {
		list(): MaybePromise<Iterable<string> | AsyncIterable<string>>;
		read(entry: string): MaybePromise<ReadResult>;
		parse(body: ReadResult, entry: string): MaybePromise<T>;
		finally?(): MaybePromise<void>;
		onError?(error: unknown): MaybePromise<void>;
	};
}

export async function* createReader<T extends Data>(options: createReader.Options<T>) {
	const { list, read, parse, onError = (error) => { throw error; } } = options;

	// Assertions
	if (typeof list !== 'function') throw new Error("Argument type mismatch: 'list' expects a 'function' type.");
	if (typeof read !== 'function') throw new Error("Argument type mismatch: 'read' expects a 'function' type.");
	if (typeof parse !== 'function') throw new Error("Argument type mismatch: 'parse' expects a 'function' type.");
	if (typeof onError !== 'function') throw new Error("Argument type mismatch: 'onError' expects a 'function' type.");

	const entries = await list();

	if (!isIterable(entries) && !isAsyncIterable(entries))
		throw new Error('Argument type mismatch: return of \'list\' expected to be an \'iterable\' or an \'asyncIterable\' type.');

	try {
		for await (const entry of entries) {
			try {
				yield await parse(await read(entry), entry);
			} catch (error) {
				await onError(error);
			}
		}
	} finally {
		await options.finally?.();
	}
}
