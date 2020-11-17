import {describe, test, expect} from '@jest/globals';

import sass from 'node-sass';
import path from 'path';

import conditionalImporter from '../src';
// Test both commonjs and ES6 import compatibility.
const conditionalImporterCommonJS = require('../src');

describe('conditionalImporter', () => {
  test('resolves the development _style.scss partial', function () {
    let result = sass.renderSync({
      file: './test/fixtures/partials/main.scss',
      outputStyle: 'compressed',
      importer: [
        conditionalImporter({
          environments: [
            'development',
          ],
        }),
      ],
    });

    expect(result.css.toString().trim()).toBe("body{content:'development'}");
  });

  test('resolves the production _style.scss partial without extension', function () {
    let result = sass.renderSync({
      file: './test/fixtures/partials/main.no-ext.scss',
      outputStyle: 'compressed',
      importer: [
        conditionalImporter({
          environments: [
            'production',
          ],
        }),
      ],
    });

    expect(result.css.toString().trim()).toBe("body{content:'production'}");
  });

  test('resolves the default _style.scss partial with no environments', function () {
    let result = sass.renderSync({
      file: './test/fixtures/partials/main.no-ext.scss',
      outputStyle: 'compressed',
      importer: [
        conditionalImporter(),
      ],
    });

    expect(result.css.toString().trim()).toBe("body{content:'default'}");
  });

  test('resolves the production style.scss import using includePaths', function () {
    let result = sass.renderSync({
      file: './test/fixtures/include-paths/main.scss',
      outputStyle: 'compressed',
      includePaths: [
        './test/fixtures/include-paths/dir',
      ],
      importer: [
        conditionalImporter({
          environments: [
            'production'
          ],
        }),
      ],
    });

    expect(result.css.toString().trim()).toBe("body{content:'include-production'}");
  });

  test('ignores and renders css @imports as expected', function () {
    let result = sass.renderSync({
      file: './test/fixtures/css/main.scss',
      outputStyle: 'compressed',
      importer: [
        conditionalImporter({
          environments: [
            'production'
          ],
        }),
      ],
    });

    expect(result.css.toString().trim())
      .toBe('@import "http://fonts.googleapis.com/css?family=Droid+Sans";@import url(theme);@import "landscape" screen and (orientation: landscape)');
  });

  test('resolve with a custom resolver', function () {
    let result = sass.renderSync({
      file: './test/fixtures/custom-resolver/main.scss',
      outputStyle: 'compressed',
      importer: [
        conditionalImporter({
          environments: [
            'custom',
          ],
          resolver: (dir, url) => {
            return path.resolve(dir, 'custom', url);
          },
        }),
      ],
    });

    expect(result.css.toString().trim()).toBe("body{content:'resolve-custom'}");
  });

  test('throws an import-loop exception.', function () {
    expect(() => {
      sass.renderSync({
        file: './test/fixtures/import-loop/main.scss',
        outputStyle: 'compressed',
        importer: [
          conditionalImporter({
            environments: [
              'development'
            ],
          }),
        ],
      });
    }).toThrowError('An @import loop has been found:');
  });

  test('throws an exception when the environment is not an array', function () {
    expect(() => {
      sass.renderSync({
        file: './test/fixtures/partials/main.scss',
        outputStyle: 'compressed',
        importer: [
          conditionalImporterCommonJS({
            // Pass in a string.
            environments: 'production',
          }),
        ],
      });
    }).toThrowError(new Error('The "environments" option must be an array.'));
  });

});
