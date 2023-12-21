# CHANGELOG

## 7.0.0-alpha.0
- New `CreateReader` and `CreateWriter` utilities available as `from` and `to` prop values.
- Writers now recieve an AsyncIterable as the previous method made too much confusion.
- Type defintion improvements.
- Test suite switched from tap to mocha for now.
- Coverage reports switched from nyc to c8.


## 6.0.0
- Adopt JS iterator protocol for the writer callbacks.
- Removed the `.teardown()` call on the writer when iteration finished. The iterator protocol gives better tools to express these logic.


## 5.0.3
- Updated .npmignore to remove unneeded files from package.

## 5.0.2
- Use Github Actions instead of Travis-CI, replace Build status badge.

## 5.0.1
- Updated maintenance badge in README.md.

## 5.0.0
- Added a `.teardown()` call on the writer which is executed when iteration finished.
- Provided better type definitions.


## 4.0.0
- Now types are exported in a namespace.


## 3.0.4
- Updated eslint config.

## 3.0.3
- Added esm tests.
- Improved build configuration.

## 3.0.2
- Improved examples.

## 3.0.1
- Updated docs.

## 3.0.0
- Removed `variables` option on `Route` type. You can use `.bind()` on the writer to achieve the same functionality.
- Updated tests.
- Updated README.md.


## 2.1.0
- In addition to the default export, now the main function also gets exported as `staticPages`.

## 2.0.2
- Updated dependencies.
- Updated docker image link in README.md.

## 2.0.1
- Fixed a typo in README.md.

## 2.0.0
- Made configuration a bit cleaner and predictable by wrapping additional variables in a `variables` key in the `Route` type.
- Updated tests.
- Updated docs.
- Changed some eslint configuration.


## 1.0.4
- Improved esmodule compatibility.
- Simplified syntax of `Data` type.

## 1.0.3
- Made `isIterable` test a bit cleaner.

## 1.0.2
- Added eslint support.

## 1.0.1
- First stable release.
- Added node12 support.
- Updated .npmignore to remove unneeded files from package.
- Updated dependencies.
- Updated examples in README.md.
- Added badges to README.md.


## 0.1.6
- Updated tests to get 100% coverage.
- Added test cases when `staticPages()` should throw.
- Fixed a faulty throws case.

## 0.1.5
- Added Travis testing and Coveralls coverage badge to README.md.

## 0.1.4
- Improved README.md.

## 0.1.3
- Added error handling which should throw when invalid params provided.

## 0.1.2
- Configured a `prepack` script to automatically test before publish.

## 0.1.1
- Updated .npmignore to omit /src folder from release.
- Updated package keywords.

## 0.1.0
- Initial work in progress release.
