# node-sass-conditional-importer

A conditional/dynamic importer for [node-sass]. It provides the ability to `@import` Sass files dynamically based on 
their (environment) extension prefix, similar to React Native's 
[platform-specific extensions][react-platform-specific-extensions] behaviour.

[![npm](https://img.shields.io/npm/v/node-sass-conditional-importer.svg)](https://www.npmjs.com/package/node-sass-conditional-importer)
[![build status](https://travis-ci.org/codebymikey/node-sass-conditional-importer.svg?branch=master)](https://travis-ci.org/codebymikey/node-sass-conditional-importer)

It reads in a list of `environments` extension prefixes, which it'll attempt to use over the default file.

The example use case for this importer is as follows, say you have the following folder structure:

```
scss
├── custom
│   ├── style.custom.scss
│   ├── style.development.scss
│   ├── style.production.scss
│   └── style.scss
└── main.scss
```

And you want to import a different version of `style.scss` based on a given build environment/variable.
This is not currently possible easily because Sass does not allow dynamic `@import`s 
[using interpolation][sass-no-dynamic-imports] or in [`if` statements][sass-no-if-imports].

This importer allows you to simply pass in your current environment into the importer, and it checks 
for whether the environment-specific override file exists before importing it.

The `environments` will be a list of environments ordered by the priority with which they should be used.

If none of the environment file overrides are available, then it falls back to the original file.

## Usage
### Configuration options
* `environments`: An array of environment extensions to look up. e.g.
    ```javascript
    // process.env.NODE_ENV = 'production';
    // Look for [`${file}.production.scss`, `${file}.fallback.scss`]
    [process.env.NODE_ENV, 'fallback']
    ```

### [node-sass]
This module hooks into [node-sass's importer api][node-sass-importer-api].

```javascript
var sass = require('node-sass');
var conditionalImporter = require('node-sass-conditional-importer');

sass.render({
  file: scssFilename,
  importer: [
    conditionalImporter({
      environments: [
        // Search for `*.custom.scss` files first,
        // Followed `*.(development|production).scss` files.
        'custom',
        process.env.NODE_ENV,
      ],
    }),
    // .. other importers
  ],
}, function(err, result) { /*...*/ });
```

### Webpack / [sass-loader](https://github.com/jtangelder/sass-loader)

#### Webpack v1

```javascript
import conditionalImporter from 'node-sass-conditional-importer';

// Webpack config
export default {
  module: {
    loaders: [{
      test: /\.scss$/,
      loaders: ['style', 'css', 'sass']
    }],
  },
  sassLoader: {
    importer: conditionalImporter({
      environments: [
        // Import based on the NODE_ENV environment variable.
        process.env.NODE_ENV,
      ],
    })
  }
};
```

#### Webpack v2

```javascript
import conditionalImporter from 'node-sass-conditional-importer';

// Webpack config
export default {
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            },
          },
          {
            loader: 'sass-loader',
            options: {
              importer: conditionalImporter({
                environments: [
                  // Import based on the NODE_ENV environment variable.
                  process.env.NODE_ENV,
                ],
              }),
            },
          },
        ],
      },
    ],
  },
};
```

## Custom resolver

Should you care to resolve paths using some kind of custom logic, for example,
resolving `~/` relative to the project root or some other arbitrary directory, 
you can do it using the following:

`main.scss`:

```scss
@import '~/dynamic.scss';
body {
  background: $background;
}
```

`custom/dynamic.myenvironment.scss`:

```scss
$background: red;
```

```js
var path = require('path');
var sass = require('node-sass');
var conditionalImporter = require('node-sass-conditional-importer');

sass.render({
  file: './main.scss',
  importer: [
    conditionalImporter({
      environments: ['myenvironment'],
      resolver: function(dir, url) {
        return url.startsWith('~/')
          ? path.resolve(dir, 'custom', url.substr(2))
          : path.resolve(dir, url);
      },
    })  
  ],
}, function(err, result) { console.log(err || result.css.toString()) });
```

## Known issues

- With a folder structure like:
    ```
    scss
    ├── custom
    │   ├── style.custom.scss
    │   ├── style.development.scss
    │   ├── style.production.scss
    │   └── style.scss
    └── main.scss
    ```

    A file like `style.production.scss` may not be used to import `style.scss` as it'll result in an import loop.

    The recommended solution is to create a shared include file like `_style--shared.scss` and import that instead.

## Thanks to
This importer is inspired by [node-sass-json-importer].

## 📄 License

node-sass-conditional-importer is MIT licensed, as found in the [LICENSE][license] file.

[node-sass]: https://github.com/sass/node-sass
[react-platform-specific-extensions]: https://reactnative.dev/docs/platform-specific-code#platform-specific-extensions
[node-sass-importer-api]: https://github.com/sass/node-sass#importer--v200---experimental
[node-sass-json-importer]: https://github.com/pmowrer/node-sass-json-importer
[sass-no-dynamic-imports]: https://sass-lang.com/documentation/at-rules/import#interpolation
[sass-no-if-imports]: https://stackoverflow.com/q/13879042
[license]: https://github.com/codebymikey/node-sass-conditional-importer/blob/master/LICENSE.md
