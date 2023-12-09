import picomatch from 'picomatch';
import type { Backend } from './helpers.js';
import { join, resolve, relative } from 'path';
import { readdir, readFile, writeFile, stat } from 'fs/promises';

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

export namespace nodefsBackend {
	export type Options = {
		since?: Date;
		dependencies?: Record<string, string | string[] | { (matches: string[]): string | string[]; }>;
		cwd?: string;
	};
}

export function nodefsBackend({
	since,
	dependencies,
	cwd = '.',
}: nodefsBackend.Options = {}): Backend {
	return {
		/**
		 * This implementation creates a tree that ignores items older than `since` with no dependencies newer than `since`.
		 *
		 * Format of dependencies:
		 * ```js
		 * {
		 *   "dependency1-pattern": "item1-pattern",
		 *   "dependency2-pattern": ["item1-pattern", "item2-pattern"]
		 *   "dependency3-pattern": (matches) => ["item1-pattern", "item2-pattern"]
		 * }
		 * ```
		 */
		async tree(dirname: string): Promise<string[]> {
			const files = await tree(dirname);
			if (!since) return files;

			const basedir = relative(cwd, dirname);
			const mtimes = await Promise.all(
				files.map(f => stat(resolve(basedir, f)).then(s => [f, s.mtime]))
			);

			return mtimes.filter(x => since < x[1]).map(x => x[0]);

			return files.filter(async file => {
				return since < await stat(resolve(cwd, file)).mtime
					|| micromatch.any(file, triggeredPatterns);
			});
			//const triggeredPatterns = getTriggered(cwd, since, triggers);
		},
		read,
		write,
	};
}


// const isMatch = picomatch(pattern ?? '**/*', { cwd, ignore });
// for await (const filename of filenames) {
// 	if (isMatch(filename)) {
// 		filteredFilenames.push(filename);
// 	}
// }

export default nodefsBackend;

function getTriggered(cwd: string, lastReadTime: Date, triggers: Record<string, string | string[] | { (matches: string[]): string[]; }>) {
	const result = new Set<string>();

	for (const srcPattern of Object.keys(triggers)) {
		const filesMatchingSrcPattern = glob.sync(srcPattern, {
			absolute: false,
			cwd: cwd,
			caseSensitiveMatch: false
		});

		const changedFilesMatchingSrcPattern = filesMatchingSrcPattern
			.filter(f => lastReadTime < fs.statSync(resolve(cwd, f)).mtime);

		if (changedFilesMatchingSrcPattern.length > 0) {
			const dest = triggers[srcPattern];
			if (typeof dest === 'function') {
				const destPatterns = dest(changedFilesMatchingSrcPattern);
				for (const pattern of destPatterns) {
					result.add(pattern);
				}
			} else if (Array.isArray(dest)) {
				for (const pattern of dest) {
					result.add(pattern);
				}
			} else {
				result.add(dest);
			}
		}
	}
	return [...result];
}
