import picomatch from 'picomatch';
import type { Filesystem } from './helpers.js';
import { getType, isIterable, isAsyncIterable, isFilesystem } from './helpers.js';
import { parse as parseYAML } from 'yaml';
import parseMarkdown from 'gray-matter';
import nodeFs from 'node:fs';

export type CreateReaderOptions<T> = {
	fs?: Filesystem;
	cwd?: string;
	pattern?: string | string[];
	ignore?: string | string[];
	parse?(content: Uint8Array | string, filename: string): T | Promise<T>;
	onError?(error: unknown): void | Promise<void>;
} | undefined;

export const isCreateReaderOptions = <T>(x: unknown): x is CreateReaderOptions<T> => {
	return x == undefined || (!!x && typeof x === 'object' && !isIterable(x) && !isAsyncIterable(x));
};

const defaultParser = (content: string | Uint8Array, filename: string) => {
	const dot = filename.lastIndexOf('.');
	if (dot < 1) {
		throw new Error(`Could not parse document without an extension.`);
	}
	const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
	let doc: any;
	switch (extension) {
		case 'json':
			doc = JSON.parse(content.toString());
			break;

		case 'yaml':
		case 'yml':
			doc = parseYAML(content.toString());
			break;

		case 'md':
		case 'markdown':
			const { data, content: markdownContent } = parseMarkdown(content.toString());
			doc = { ...data, content: markdownContent };
			break;

		default:
			throw new Error(`Could not parse document with '${extension}' extension.`);
	}
	if (doc && typeof doc === 'object' && !('url' in doc)) {
		doc.url = filename.substring(0, dot).replace(/\\/g, '/');
	}
	return doc;
};

export async function* createReader<T>({
	fs = nodeFs,
	cwd = 'pages',
	pattern,
	ignore,
	parse = defaultParser,
	onError = (error: unknown) => { throw error; },
}: CreateReaderOptions<T> = {}) {
	if (!isFilesystem(fs)) throw new TypeError(`Expected Node FS compatible implementation at 'fs' property.`);
	if (typeof cwd !== 'string') throw new TypeError(`Expected 'string', recieved '${getType(cwd)}' at 'cwd' property.`);
	if (!cwd) throw new TypeError(`Expected non-empty string at 'cwd'.`);
	if (typeof pattern !== 'undefined' && typeof pattern !== 'string' && !Array.isArray(pattern)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(pattern)}' at 'pattern' property.`);
	if (typeof ignore !== 'undefined' && typeof ignore !== 'string' && !Array.isArray(ignore)) throw new TypeError(`Expected 'string' or 'string[]', recieved '${getType(ignore)}' at 'ignore' property.`);
	if (typeof parse !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(parse)}' at 'parse' property.`);
	if (typeof onError !== 'function') throw new TypeError(`Expected 'function', recieved '${getType(onError)}' at 'onError' property.`);

	let filenames: string[] = await new Promise((resolve, reject) => {
		fs.readdir(cwd, { recursive: true, withFileTypes: false, encoding: 'utf8' }, (err, entries) => {
			if (err) return reject(err);
			let filtered: string[] = [];
			let processed = 0;
			for (const entry of entries) {
				fs.stat(cwd + '/' + entry, (err, stats) => {
					if (err) return reject(err);
					if (stats.isFile()) {
						filtered.push(entry);
					}
					if (++processed === entries.length) {
						return resolve(filtered);
					}
				});
			}
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
				fs.readFile(cwd + '/' + filename, (err, data) => {
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
