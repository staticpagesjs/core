import picomatch from 'picomatch';
import { autoparse } from './autoparse.js';
import type { MaybePromise, Filesystem } from './helpers.js';
import { getType, isIterable, isAsyncIterable, isFilesystem } from './helpers.js';
import { join, relative } from 'node:path';
import nodeFs from 'node:fs';

export namespace createReader {
	export interface Options<T> {
		fs?: Filesystem;
		cwd?: string;
		pattern?: string | string[];
		ignore?: string | string[];
		parse?(content: Uint8Array | string, filename: string): MaybePromise<T>;
		onError?(error: unknown): MaybePromise<void>;
	}
}

export async function* createReader<T>({
	fs = nodeFs,
	cwd = 'pages',
	pattern,
	ignore,
	parse = autoparse,
	onError = (error: unknown) => { throw error; },
}: createReader.Options<T> = {}) {
	if (!isFilesystem(fs)) throw new TypeError(`Expected Node FS compatible implementation at 'fs' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof pattern !== 'undefined' && typeof pattern !== 'string' && !Array.isArray(pattern)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(pattern)}' at 'pattern' property.`);
	if (typeof ignore !== 'undefined' && typeof ignore !== 'string' && !Array.isArray(ignore)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(ignore)}' at 'ignore' property.`);
	if (typeof parse !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(parse)}' at 'parse' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	let filenames: string[] = await new Promise((resolve, reject) => {
		fs.readdir(cwd, { encoding: 'utf8', recursive: true, withFileTypes: true }, (err, files) => {
			if (err) reject(err);
			else resolve(
				files
					.filter(x => x.isFile())
					.map(x => join(relative(cwd, x.path), x.name))
			);
		});
	});

	if (typeof pattern !== 'undefined' || typeof ignore !== 'undefined') {
		const filteredFilenames = [];
		const isMatch = picomatch(pattern ?? '**/*', { ignore });
		for (const filename of filenames) {
			if (isMatch(filename)) {
				filteredFilenames.push(filename);
			}
		}
		filenames = filteredFilenames;
	}

	for (const filename of filenames) {
		try {
			const content: Uint8Array = await new Promise((resolve, reject) => {
				fs.readFile(join(cwd, filename), (err, data) => {
					if (err) reject(err);
					else resolve(data);
				});
			});
			yield await parse(content, filename);
		} catch (error) {
			await onError(error);
		}
	}
}

createReader.isOptions = <T>(x: unknown): x is createReader.Options<T> => {
	return x == undefined || (!!x && typeof x === 'object' && !isIterable(x) && !isAsyncIterable(x));
};
