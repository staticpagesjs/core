# Static Pages / Core

[![Build Status](https://github.com/staticpagesjs/core/actions/workflows/build.yaml/badge.svg)](https://github.com/staticpagesjs/core/actions/workflows/build.yaml)
[![Coverage Status](https://coveralls.io/repos/github/staticpagesjs/core/badge.svg?branch=master)](https://coveralls.io/github/staticpagesjs/core?branch=master)
![npms.io (quality)](https://img.shields.io/npms-io/quality-score/@static-pages/core?label=quality)
![Maintenance](https://img.shields.io/maintenance/yes/2023)

This package contains only the core; this means it does not provide CLI support or readers and writers.
You can import this library to your JS project then add your own controllers, readers and writers.

Yet another static pages generator?
Yes! Because I browsed the whole jamstack scene, but could not find one which
1. uses MVC pattern
2. can read input from any source (YAML, JSON, front-matter style markdowns, database etc.)
3. can render with any template engine (Twig, ejs, Pug, Mustache etc.)
4. supports incremental builds
5. has a flexible CLI tool (see [@static-pages/cli](https://www.npmjs.com/package/@static-pages/cli) on npm)
6. has a Docker image (see [staticpages/cli](https://hub.docker.com/repository/docker/staticpages/cli) on dockerhub)
7. written in JS (preferably TypeScript)
8. easy to extend with JS code
9. learning and using is easy (Gatsby, Hugo, Jekyll, Eleventy etc. are so cool but harder to learn and configure)

And because I wrote a ton of custom static generators before; I tought I can improve the concepts to a point where its (hopefully) useful for others.

## Where should I use this?
This project targets small and medium sized projects. The rendering process tries to be as fast as possible so its also useful when you need performance.

## Documentation
[Visit the project page.](https://staticpagesjs.github.io/)

## Usage

```js
import staticPages from '@static-pages/core';
import createFSBackend from '@static-pages/nodefs-backend';
import parsers from '@static-pages/parsers';
import twig from '@static-pages/twig-renderer';

// Handles filesystem operations for us.
const fsBackend = createFSBackend({
    cwd: 'path/to/project/root'
});

// Default options for every `Route`.
const generate = staticPages.with({
    from: {
        backend: fsBackend,
        parse: parsers.autodetect, // guess & parse files by their extension
    },
    to: {
        backend: fsBackend,
        cwd: 'dist', // the output directory
        render: twig({
            view: 'content.html.twig',
            viewsDir: 'path/to/views/folder',
        }),
    },
    controller(data) {
        data.now = new Date().toJSON(); // adds a 'now' variable to the template context
        return data; // returning the data is required if you want to send it to the renderer
    }
});

// Generate every document type as a page.
generate({
    from: {
        cwd: 'pages',
        pattern: '**/*.md',
    },
}, {
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

> The `controller` may return with multiple documents; each will be rendered as a separate page. Alternatively it may return `undefined` to prevent the rendering of the current document.

> The `from` parameter can also recieve an `Iterable` or an `AsyncIterable` type!

> The `to` parameter can also recieve a `function` that handles the document rendering and storing!


## `staticPages(...routes: Route[]): Promise<void>`

Each route consists of a `from`, `to` and optionally a `controller` property matching the definition below.

```ts
interface Route<F, T> {
    from: Iterable<F> | AsyncIterable<F> | CreateReaderOptions<F>;
    to: { (data: AsyncIterable<T>): MaybePromise<void>; } | CreateWriterOptions<T>;
    controller?(data: F): MaybePromise<undefined | T | Iterable<T> | AsyncIterable<T>>;
}

type MaybePromise<T> = T | Promise<T>;

interface CreateReaderOptions<T> {
    backend: Backend;
    cwd?: string;
    pattern?: string | string[];
    ignore?: string | string[];
    parse?(content: Uint8Array | string, filename: string): MaybePromise<T>;
    catch?(error: unknown): MaybePromise<void>;
    finally?(): MaybePromise<void>;
}

interface CreateWriterOptions<T> {
    backend: Backend;
    cwd?: string;
    render(data: T): MaybePromise<Uint8Array | string>;
    name?(data: T): MaybePromise<string>;
    catch?(error: unknown): MaybePromise<void>;
    finally?(): MaybePromise<void>;
}

interface Backend {
    tree(dirname: string): MaybePromise<Iterable<string> | AsyncIterable<string>>;
    read(filename: string): MaybePromise<Uint8Array | string>;
    write(filename: string, data: Uint8Array | string): MaybePromise<void>;
}
```

## `staticPages.with(defaults: Partial<Route>): { (...routes: Partial<Route>[]): Promise<void>; }`

Preconfigures a separate instance of the `staticPages` call with the given default parameters.
These only works as fallback values, you can override every value later.

If a `from` or `to` parameter is a plain object in both defaults and later at the route definition they will be merged (see usage example).

### `CreateReaderOptions` built-in default parameters when not provided
- `cwd`: `'.'`
- `parse`: `JSON.parse`
- `catch`: `(err) => { throw err; }`

### `CreateWriterOptions` built-in default parameters when not provided
- `cwd`: `'.'`
- `name`: `(data) => data.url`
- `catch`: `(err) => { throw err; }`


## Missing a feature?
Create an issue describing your needs. If it fits the scope of the project I will implement it or you can implement it your own and submit a pull request.
