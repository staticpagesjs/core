import { staticPages, createReader, createWriter } from './src/index.js';

staticPages({
	from: createReader({
		list() {
			return [];
		},
		read(entry) {
			return '';
		},
		parse() {
			return {a: 1};
		},
	}),
	to: createWriter({
		name(data) {
			return data.url as string;
		},
		render(data) {
			return JSON.stringify(data);
		},
		write(name, data) {
			fs.writeFileSync(name, data);
		},
	}),
	controller(data) {
		return {a: 1};
	},
});


const gitlab = new Gitlab({
	url: 'https://gitlab.com/lionel87/project',
	user: 'alma',
	password: 'kecske',
})

staticPages({
	from: gitlab.readUpdatedSinceCommit(),
	to: gitlab.write({
		path: 1
	}),
})


gitlab.reader({

})


staticPages({
	from: fsReader({
		path: 'somepath',
	}),
	to: gitlab.write({
		path: 1
	}),
});

import git from '@staticpages/git';
import gitlab from '@staticpages/gitlab';
import github from '@staticpages/github';
import filesystem from '@staticpages/filesystem';

import parser from '@staticpages/parser';

import twig from '@staticpages/twig-renderer';
import pug from '@staticpages/pug-renderer';

// bypassSince: Record<string, string | string[] | { (matches: string[]): string | string[]; }>;

staticPages({
	from: gitlab.reader({
		server: process.env.CI_SERVER_URL, // ez valószínűleg nem CI-ben fut ilyenkor
		token: process.env.CI_JOB_TOKEN,
		project: process.env.CI_PROJECT_PATH,
		branch: process.env.CI_COMMIT_BRANCH,
		path: '.',
		pattern: '*.json',
		ignore: '_*.json',
		since: process.env.CI_COMMIT_BEFORE_SHA, // not default.
		bypassSince(aFile, bFile) {},
		filter(name){ return true; },
		parse(data, name) { return {}; },
		onError(error) { throw error; },
	}),
	to: gitlab.writer({
		server: process.env.CI_SERVER_URL,
		token: process.env.CI_JOB_TOKEN,
		project: process.env.CI_PROJECT_PATH, // ez nem jó default.
		author: process.env.CI_COMMIT_AUTHOR,
		message: process.env.CI_COMMIT_MESSAGE,
		path: 'dist',
		name(data) { return data.url + '.html'; },
		render: twig({
			fs: gitlab.fs({ // ezt másképp hogy?
				server: process.env.CI_SERVER_URL,
				token: process.env.CI_JOB_TOKEN,
				project: process.env.CI_PROJECT_PATH,
			}),
			view: 'main.twig',
			views: 'views',
		}),
		onError(error) { throw error; },
	}),
	controller(data) {
		return data;
	},
})

staticPages({
	from: git.reader({
		repository: '.',
		branch: 'master',
		cwd: '.',
		pattern: '*.json',
		ignorePattern: '_*.json',
		since: process.env.CI_COMMIT_BEFORE_SHA, // not default.
		dependencies(aFile, bFile) {},
		filter(name){ return true; },
		parse(data, name) { return {}; },
		onError(error) { throw error; },
	}),
	to: git.writer({
		repository: '.',
		branch: 'master',
		author: 'Author <some@email.com>',
		message: 'automated commit',

		cwd: 'dist',
		name(data) { return data.url + '.html'; },
		render: twig({
			fs: gitlab.fs({ // ezt másképp hogy?
				server: process.env.CI_SERVER_URL,
				token: process.env.CI_JOB_TOKEN,
				project: process.env.CI_PROJECT_PATH,
			}),
			view: 'main.twig',
			views: 'views',
		}),
		onError(error) { throw error; },
	}),
	controller(data) {
		return data;
	},
})


!{
	from: {
		fs: nodefs({
			cwd: '.',
		}),
		pattern:
	}
}

const x: ParsedFile<boolean>;

// changes(since, dirnames[])
// tree(dirname, since, deps)
// read(filename)
// write(filename, data)
// delete(filename)
// commit()

// readdir
// mkdir
// readFile
// writeFile
// rename
// unlink
// stat


const gitlab = gitlabfs({
	repository: '.',
	branch: 'master',
	since: Date.now(),
	dependencies(aFile, bFile) {},
});

new_staticPages({
	from: {
		backend: gitlab,
		cwd: '.',
		pattern: '*.json',
		ignorePattern: '_*.json',
		parse(file) { return {}; },
		onError(error) { throw error; },
	},
	to: {
		fs: gitlab,
		cwd: 'dist',
		render: twig,
	}
})
.catch(console.error)
.then(gitlab.commit);


// core (autoparse, fs-backend)
// git-backend, gitlab-backend, github-backend
// twig-renderer
