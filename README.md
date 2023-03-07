# Static Pages / Core

[![Build Status](https://app.travis-ci.com/staticpagesjs/core.svg?branch=master)](https://app.travis-ci.com/staticpagesjs/core)
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
__Readers__ provides an iterable list of page data. __Controllers__ can manipulate and extend each data object. __Writers__ render the final output for you.

```js
import staticPages from '@static-pages/core';
import markdownReader from '@static-pages/markdown-reader';
import yamlReader from '@static-pages/yaml-reader';
import twigWriter from '@static-pages/twig-writer';

staticPages({
    from: markdownReader({
        pattern: "pages/**/*.md"
    }),
    to: twigWriter({
        view: "content.html.twig",
        viewsDir: "path/to/views/folder",
        outDir: "path/to/output/folder",
    }),
    controller(data) {
        data.timestamp = new Date().toJSON(); // adds a "timestamp" variable
        return data; // returning the data is required if you want to send it to the renderer
    }
}, {
    from: yamlReader({ // assume we have the home page data in yaml format.
        pattern: "home/*.yaml" // <-- reads home/en.yaml, home/de.yaml, home/fr.yaml etc.
    }),
    to: twigWriter({
        view: "home.html.twig",
        viewsDir: "path/to/views/folder",
        outDir: "path/to/output/folder",
    }),
    controller(data) {
        data.commitHash = yourGetCommitHashFn();
        return data;
    }
})
.catch(error => {
    console.error('Error:', error);
    console.error(error.stack);
});
```

## `staticPages(...routes: Route[])`

Each route consists of a `from`, `to` and optionally a `controller` property matching the definition below.

```ts
type Data = Record<string, unknown>;
type Route = {
    from: Iterable<Data> | AsyncIterable<Data>;
    to: { (data: Data): void | Promise<void>; teardown?(): void | Promise<void>; };
    controller?(data: Data): void | Data | Data[] | Promise<void | Data | Data[]>;
};
```

> Tip: Controllers may return an array of `Data` objects; each will be rendered as a separate page.
> Alternatively it may return `void` to prevent the rendering of the current data object.

> Tip: To schedule cleanup after writers you can define a `.teardown()` member on the writer call.
> This callback will be run after the last page is processed. If more writers provide the same callback
> its only executed once.

## Missing a feature?
Create an issue describing your needs. If it fits the scope of the project I will implement it or you can implement it your own and submit a pull request.
