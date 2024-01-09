import type { Filesystem } from './helpers.js';
import { getType, isFilesystem } from './helpers.js';
import * as nodeFs from 'node:fs';
import { dirname } from 'node:path';

export type CreateWriterOptions<T> = {
	fs?: Filesystem;
	cwd?: string;
	name?(data: T): string | Promise<string>;
	render?(data: T): Uint8Array | string | Promise<Uint8Array | string>;
	onError?(error: unknown): void | Promise<void>;
} | undefined;

export const isCreateWriterOptions = <T>(x: unknown): x is CreateWriterOptions<T> => {
	return x == undefined || (!!x && typeof x === 'object');
};

const defaultNamer = <T>(data: T) => {
	if (!!data && typeof data === 'object' && 'url' in data && typeof data.url === 'string') {
		return data.url.concat('.html');
	}
	throw new Error(`Missing 'url' field in the document.`);
};

const defaultRenderer = <T>(data: T) => {
	if (!!data && typeof data === 'object' && 'content' in data) {
		return '' + data.content;
	}
	throw new Error(`Missing 'content' field in the document.`);
};

export function createWriter<T>({
	fs = nodeFs,
	cwd = 'public',
	name = defaultNamer,
	render = defaultRenderer,
	onError = (error: unknown) => { throw error; },
}: CreateWriterOptions<T> = {}) {
	if (!isFilesystem(fs)) throw new TypeError(`Expected Node FS compatible implementation at 'fs' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof render !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(render)}' at 'render' property.`);
	if (typeof name !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(name)}' at 'name' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	return async function (data: T) {
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
	};
}
