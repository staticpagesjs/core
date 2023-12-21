export type MaybePromise<T> = T | Promise<T>;

interface Stats {
	isFile(): boolean;
	isDirectory(): boolean;
}

interface Dirent {
	name: string;
	path: string;
	isFile(): boolean;
	isDirectory(): boolean;
}

export interface Filesystem {
	readdir(
		path: string | URL,
		options: {
			encoding: 'utf8';
			withFileTypes: false;
			recursive: boolean;
		},
		callback: (err: Error | null, files: string[]) => void,
	): void;

	readdir(
		path: string | URL,
		options: {
			encoding: 'utf8';
			withFileTypes: true;
			recursive: boolean;
		},
		callback: (err: Error | null, files: Dirent[]) => void,
	): void;

	readFile(
		path: string | URL,
		options: {
			encoding: 'utf8';
		},
		callback: (err: Error | null, data: string) => void
	): void;

	readFile(
		path: string | URL,
		options: null,
		callback: (err: Error | null, data: Uint8Array) => void
	): void;

	stat(
		path: string | URL,
		callback: (err: Error | null, stats: Stats) => void
	): void;

	mkdir(
		path: string | URL,
		options: {
			recursive: true;
		},
		callback: (err: Error | null, path?: string) => void
	): void;

	writeFile(
		path: string | URL,
		data: string | Uint8Array,
		callback: (err: Error | null) => void
	): void;
}

export const isFilesystem = (x: unknown): x is Filesystem => !!x && typeof x === 'object' && 'stat' in x && 'mkdir' in x && 'readFile' in x && 'writeFile' in x;

export const isIterable = <T>(x: unknown): x is Iterable<T> => !!x && typeof x === 'object' && Symbol.iterator in x && typeof x[Symbol.iterator] === 'function';
export const isAsyncIterable = <T>(x: unknown): x is AsyncIterable<T> => !!x && typeof x === 'object' && Symbol.asyncIterator in x && typeof x[Symbol.asyncIterator] === 'function';

export const getType = (x: unknown): string => typeof x === 'object' ? (x ? 'object' : 'null') : typeof x;
