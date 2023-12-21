# Static Pages / Core

[![Build Status](https://github.com/staticpagesjs/core/actions/workflows/build.yaml/badge.svg)](https://github.com/staticpagesjs/core/actions/workflows/build.yaml)
[![Coverage Status](https://coveralls.io/repos/github/staticpagesjs/core/badge.svg?branch=master)](https://coveralls.io/github/staticpagesjs/core?branch=master)
![npms.io (quality)](https://img.shields.io/npms-io/quality-score/@static-pages/core?label=quality)
![Maintenance](https://img.shields.io/maintenance/yes/2024)

Yet another static pages generator?
Yes! Because I browsed the whole jamstack scene, but could not find one which
1. can read input from any source (YAML, JSON, front-matter style markdowns, database etc.)
2. can render with any template engine (Twig, ejs, Pug, Mustache etc.)
3. written in JS (preferably TypeScript)
4. easy to extend with JS code
5. supports incremental builds
6. uses MVC pattern
7. learning and using is easy (Gatsby, Hugo, Jekyll, Eleventy etc. are so cool but harder to learn and configure)

And because I wrote a ton of custom static generators before; I tought I can improve the concepts to a point where its (hopefully) useful for others.

## Where should I use this?

This project targets small and medium sized projects. The rendering process tries to be as fast as possible so its also useful when you need performance.

## Documentation

For detailed information, visit the [project page](https://staticpagesjs.github.io/).

## Usage

```js
import staticPages from '@static-pages/core';
import twig from '@static-pages/twig';

// Default options for every `Route` via .with() call.
const generate = staticPages.with({
    to: {
        render: twig({
            viewsDir: 'path/to/views/folder'
        }),
    },
    controller(data) {
        // adds a 'now' variable to the template context
        data.now = new Date().toJSON();

        // returning the data is required
        return data;
    }
});

// Generate every document type as a page.
// One route equals one batch of similar pages.
generate({
    from: {
        cwd: 'pages',
        pattern: '**/*.md',
    },
}, {
    // Any Iterable or AsyncIterable also accepted eg. an array
    from: [
        { title: 'About', url: 'about', body: 'About us content' },
        { title: 'Privacy', url: 'privacy', body: 'Privacy content' },
    ],
}, {
    from: {
        cwd: 'home',
        pattern: '*.yaml',
    },
    to: {
        render: twig({
            view: 'home.html.twig',
            viewsDir: 'path/to/views/folder',
        }),
    },
})
.catch(error => {
    console.error('Error:', error);
    console.error(error.stack);
});
```

### Notes

> The `controller` may return with multiple documents, each will be rendered as a separate page. Alternatively it may return `undefined` to prevent the rendering of the current document.

> The `from` parameter can also recieve an `Iterable` or an `AsyncIterable` type!

> The `to` parameter can also recieve a `function` that handles the document rendering and storing!


## `staticPages(...routes: Route[]): Promise<void>`

Each route consists of a `from`, `to` and a `controller` property matching the definition below.

```ts
interface Route<F, T> {
    from?: Iterable<F> | AsyncIterable<F> | CreateReaderOptions<F>;
    to?: { (data: AsyncIterable<T>): MaybePromise<void>; } | CreateWriterOptions<T>;
    controller?(data: F): MaybePromise<undefined | T | Iterable<T> | AsyncIterable<T>>;
}

type MaybePromise<T> = T | Promise<T>;

interface CreateReaderOptions<T> {
    // Handles file operations, defaults to nodejs `fs` module
    fs?: Filesystem;
    // Current working directory
    cwd?: string;
    // File patterns to include
    pattern?: string | string[];
    // File patterns to exclude
    ignore?: string | string[];
    // Callback to parse a file content into an object
    parse?(content: Uint8Array | string, filename: string): MaybePromise<T>;
    // Called on error
    onError?(error: unknown): MaybePromise<void>;
}

interface CreateWriterOptions<T> {
    // Handles file operations, defaults to nodejs `fs` module
    fs?: Filesystem;
    // Current working directory
    cwd?: string;
    // Callback that renders the document into a page
    render?(data: T): MaybePromise<Uint8Array | string>;
    // Callback that retrieves the filename (URL) of a page
    name?(data: T): MaybePromise<string>;
    // Called on error
    onError?(error: unknown): MaybePromise<void>;
}

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

interface Filesystem {
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
```

### `Filesystem` interface

When you use the `createReader` and `createWriter` interfaces to read and write documents, you can provide a `Filesystem` implementation. This interface is a minimal subset of the [NodeJS FS API](https://nodejs.org/api/fs.html). By default we use the built-in `node:fs` module.

### `CreateReaderOptions` default parameters
- `fs`: the nodejs `fs` module
- `cwd`: `'pages'`
- `parse`: automatically parse `json`, `yaml`, `yml`, `md` or `markdown` extensions with `yaml` and `gray-matter` packages.
- `onError`: `(err) => { throw err; }`

### `CreateWriterOptions` default parameters
- `fs`: the nodejs `fs` module
- `cwd`: `'public'`
- `name`: `(data) => data.url`
- `render`: `(data) => data.content`
- `onError`: `(err) => { throw err; }`


## `staticPages.with(defaults: Partial<Route>): { (...routes: Partial<Route>[]): Promise<void>; }`

Preconfigures a separate instance of the `staticPages` call with the given default parameters.
These only works as fallback values, you can override every value later.

If a `from` or `to` parameter is a plain object in both defaults and later at the route definition they will be merged (see usage example).


## Missing a feature?
Create an issue describing your needs!
If it fits the scope of the project I will implement it.
