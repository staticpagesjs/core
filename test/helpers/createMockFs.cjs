const path = require('node:path');

module.exports = {
	createMockFs(files, output = {}) {
		const dirs = new Set();
		return {
			readdir(dir, opts, cb) {
				cb(
					null,
					Object.keys(files).map(k => path.relative(dir, k))
				);
			},

			readFile(file, cb) {
				const dirent = Object.entries(files).find(([k, v]) => '' === path.relative(file, k));
				if (dirent) cb(null, dirent[1]);
				else cb(new Error('No file ' + file));
			},

			mkdir(file, opts, cb) { dirs.add(file); cb(null); },

			stat(file, cb) {
				if (dirs.has(file)) {
					cb(null, {
						isFile() { return false; },
						isDirectory() { return true; },
					});
				} else if (
					Object.keys(files).some(k => '' === path.relative(file, k)) ||
					Object.keys(output).some(k => '' === path.relative(file, k))
				) {
					cb(null, {
						isFile() { return true; },
						isDirectory() { return false; },
					});
				} else {
					cb(new Error('No file ' + file));
				}
			},

			writeFile(file, data, cb) {
				output[file] = data;
				cb(null);
			},
		};
	}
};
