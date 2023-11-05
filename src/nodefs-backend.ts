import type { Backend } from './helpers.js';
import { join } from 'path';
import { readdir, readFile, writeFile } from 'fs/promises';

export async function tree(directory: string): Promise<string[]> {
	const files: string[] = [];
	const walk = async (directory: string) => {
		const entries = await readdir(directory, { withFileTypes: true });
		const pending: Promise<void>[] = [];
		for (const entry of entries) {
			const entryPath = join(directory, entry.name);
			if (entry.isDirectory()) {
				pending.push(walk(entryPath));
			} else {
				files.push(entryPath);
			}
		}
		await Promise.all(pending);
	};
	await walk(directory);
	return files;
}

export function read(filename: string) {
	return readFile(filename);
}

export function write(filename: string, data: Uint8Array | string) {
	return writeFile(filename, data);
}


//TODO:
export function nodefsBackend(options: any): Backend {
	// Options: since, dependencies
	return { tree, read, write };
}

export default nodefsBackend;
