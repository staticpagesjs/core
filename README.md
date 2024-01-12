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

This project is structured as a toolkit, published under the [@static-pages](https://www.npmjs.com/search?q=%40static-pages) namespace on NPM.
In most cases you should not use this core package directly, but the [@static-pages/starter](https://www.npmjs.com/package/@static-pages/starter) is a good point to begin with.

## Where should I use this?

This project targets small and medium sized websites. The rendering process tries to be as fast as possible so its also useful when you need performance.

## Usage

```js
import fs from 'node:fs';
import path from 'node:path';
import staticPages from '@static-pages/core';

staticPages({
    from: [
        { title: 'About', url: 'about', content: 'About us content' },
        { title: 'Privacy', url: 'privacy', content: 'Privacy content' },
    ],
    controller(data) {
        data.now = new Date().toJSON();
        return data;
    },
    to({ title, url, content, now }) {
        const fileName = path.join('public', url + '.html');
        fs.mkdirSync(path.dirname(fileName), { recursive: true });
        fs.writeFileSync(fileName, `<html><body><h1>${title}</h1><p>${content}</p><p>generated: ${now}</p></body></html>`);
    }
}, {
    from: fs.readdir('pages', { recursive: true })
        .map(x => JSON.parse(fs.readFileSync(path.join('pages', x), 'utf8'))),
    controller({ title, url, content }) {
        return {
            url: url,
            content: `<html><body><h1>${title}</h1><p>${content}</p><p>generated: ${new Date().toJSON()}</p></body></html>`,
        };
    },
    to({ url, content }) {
        const fileName = path.join('public', url + '.html');
        fs.mkdirSync(path.dirname(fileName), { recursive: true });
        fs.writeFileSync(fileName, content);
    }
})
.catch(error => {
    console.error('Error:', error);
    console.error(error.stack);
});
```

### Notes

> The `controller` may return with multiple documents, each will be rendered as a separate page. Alternatively it may return `undefined` to prevent the rendering of the current document.

> The usage example above does a rough presentation only and not considered to be a production ready snippet. Helpers to read and write documents are provided in separate packages, eg. [@static-pages/io](https://www.npmjs.com/package/@static-pages/io).

## Documentation

For detailed information, visit the [project page](https://staticpagesjs.github.io/).

### `staticPages(...routes: Route[]): Promise<void>`

Each route consists of a `from`, `to` and a `controller` property matching the definition below.

```ts
interface Route<F, T> {
    from: Iterable<F> | AsyncIterable<F>;
    to(data: T): void | Promise<void>;
    controller?(data: F): undefined | T | Iterable<T> | AsyncIterable<T> | Promise<undefined | T | Iterable<T> | AsyncIterable<T>>;
}
```

## Missing a feature?
Create an issue describing your needs!
If it fits the scope of the project I will implement it.
