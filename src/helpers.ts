export type MaybePromise<T> = T | Promise<T>;

export interface Backend {
	tree(dirname: string): MaybePromise<Iterable<string> | AsyncIterable<string>>;
	read(filename: string): MaybePromise<Uint8Array | string>;
	write(filename: string, data: Uint8Array | string): MaybePromise<void>;
}

export interface EntryMeta {
	name: string;
}

export interface Entry extends EntryMeta {
	content: Uint8Array | string;
}

export interface ParsedEntry<T> extends Entry {
	parsed: T;
}

export interface ProcessedEntry<T1, T2> extends ParsedEntry<T1> {
	processed: T2;
}

export interface RenderedEntry<T1, T2> extends ProcessedEntry<T1, T2> {
	rendered: Uint8Array | string;
}

export const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;

export const isIterable = <T>(x: any): x is Iterable<T> => typeof x?.[Symbol.iterator] === 'function';
export const isAsyncIterable = <T>(x: any): x is AsyncIterable<T> => typeof x?.[Symbol.asyncIterator] === 'function';
