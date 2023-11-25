export type MaybePromise<T> = T | Promise<T>;

export interface Backend {
	tree(dirname: string): MaybePromise<Iterable<string> | AsyncIterable<string>>;
	read(filename: string): MaybePromise<Uint8Array | string>;
	write(filename: string, data: Uint8Array | string): MaybePromise<void>;
}

export const isBackend = (x: unknown): x is Backend => !!x && typeof x === 'object' && 'tree' in x && 'read' in x && 'write' in x;

export const isIterable = <T>(x: unknown): x is Iterable<T> => !!x && typeof x === 'object' && Symbol.iterator in x && typeof x[Symbol.iterator] === 'function';
export const isAsyncIterable = <T>(x: unknown): x is AsyncIterable<T> => !!x && typeof x === 'object' && Symbol.asyncIterator in x && typeof x[Symbol.asyncIterator] === 'function';

export const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;
