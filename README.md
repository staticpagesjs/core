# Static Pages / Core

Yet another static pages generator?
Yes! Because I browsed the whole jamstack scene, but could not find one which
1. uses MVC pattern
2. can read input from any source (YAML, JSON, front-matter style markdowns, database etc.)
3. can render with any template engine (Twig, ejs, Pug, Mustache etc.)
4. supports incremental builds
5. has a flexible CLI tool (see [@static-pages/cli](https://www.npmjs.com/package/@static-pages/cli) on npm)
6. has a Docker image (see [lionel87/static-pages-js](https://hub.docker.com/repository/docker/lionel87/static-pages-js) on dockerhub)
7. written in JS (preferably TypeScript)
8. easy to extend with JS code
9. learning and using is easy (Gatsby, Hugo, Jekyll, Eleventy etc. are so cool but harder to learn and configure)

And because I wrote a ton of custom static generators before; I tought I can improve the concepts to a point where its (hopefully) useful for others.

## Where should I use this?
This project targets small and medium sized projects. The rendering process tries to be as fast as possible so its also useful when you need performance.

## Documentation
[Visit the project page.](https://staticpagesjs.github.io/)

## Usage
This package contains only the core; this means it does not provide CLI support or readers and writers. You can import this library to your JS project then add your own controllers, readers and writers.

__Readers__ provides an iterable list of page data. __Controllers__ can manipulate and extend each data object. __Writers__ render the final output for you.

```js
const staticPages = require("@static-pages/core").default;
const markdownReader = require("@static-pages/markdown-reader").default;
const yamlReader = require("@static-pages/yaml-reader").default;
const twigWriter = require("@static-pages/twig-writer").default;

staticPages([{
    from: markdownReader({
        pattern: "pages/**/*.md"
    }),
    to: twigWriter({
        view: "content.html.twig",
        views: "path/to/views/folder",
        out: "path/to/output/folder",
    }),
    controller: function(data) {
        data.timestamp = new Date().toJSON(); // adds a "timestamp" variable
        return data; // returning the data is required if you want to send it to the renderer
    }
},{
    from: yamlReader({ // assume we have the home page data in yaml format.
        pattern: "home/*.yaml" // <-- reads home/en.yaml, home/de.yaml, home/fr.yaml etc.
    }),
    to: twigWriter({
        view: "home.html.twig",
        views: "path/to/views/folder",
        out: "path/to/output/folder",
    }),
    controller: function(data) {
        data.commitHash = yourGetCommitHashFn();
        return data;
    }
}]).catch(console.error);
```

## Options of `staticPages()`
The `staticPages()` function expects one parameter which must be an array.
Each item should contain `from`, `to` and optionally a `controller` property matching the definition below.

```ts
type Options = {
    from: Iterable<Data> | AsyncIterable<Data>;
    to: (data: Data) => void | Promise<void>;
    controller?: (data: Data) => undefined | Data | Data[] | Promise<undefined | Data | Data[]>;
}[];

type Data = { [k: string]: unknown };
```

## Custom options for the controller
You can define additional properties at the same level as the `from`, `to` and `controller` keys.
These user defined properties are accessible through the `this` context variable of the controller.

```js
require("@static-pages/core").default([{
    from: ...,
    to: ...,
    controller: function(data) {
        this.myProp; // <-- 123
    },
    myProp: 123,
}]);
```

## Missing a feature?
Create an issue describing your needs. If it fits the scope of the project I will implement it or you can implement it your own and submit a pull request.
