## [2.0.1](https://github.com/codebymikey/node-sass-conditional-importer/compare/v2.0.0...v2.0.1) (2020-11-17)


### Bug Fixes

* **readme:** remove the travis-ci badge ([3b1187d](https://github.com/codebymikey/node-sass-conditional-importer/commit/3b1187dd191fed11fc483a792312f9fc87e191af))

# [2.0.0](https://github.com/codebymikey/node-sass-conditional-importer/compare/v1.0.0...v2.0.0) (2020-11-17)


### Bug Fixes

* **babel:** add support for commonjs requires. ([56b0148](https://github.com/codebymikey/node-sass-conditional-importer/commit/56b01481268c44a0dbb7a8b40125f0354ae6d0e9))
* **importer:** return null when the override file could not be found ([49bf9f9](https://github.com/codebymikey/node-sass-conditional-importer/commit/49bf9f9744f8667adae74080bad951c624d0dc01))


### BREAKING CHANGES

* **babel:** Existing imports will have to change from
```
const conditionalImporter = require('node-sass-conditional-importer').default;
```
to
```
const conditionalImporter = require('node-sass-conditional-importer');
```
* **importer:** existing behaviour might change if there were other importers being applied after
this one.

# 1.0.0 (2020-11-16)


### Features

* initial release ([96e6cd2](https://github.com/codebymikey/node-sass-conditional-importer/commit/96e6cd2fb8b9f5089f79e249828fe1463d85dff6))
