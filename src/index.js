import fs from 'fs';
import path from 'path';
import {URL} from 'url';

export default function environmentImporterGenerator(options = {}) {
  return function environmentImporter(url, prev) {
    let candidates;
    try {
      candidates = resolveCandidates(url, prev, options, this.options);
    } catch (e) {
      return e;
    }

    // Find the first entry which exists.
    let fileName = candidates.find(fileExists);

    if (fileName) {
      // Could not resolve it, return the original url.
      return {
        file: fileName,
      };
    }

    // If an importer does not want to handle a particular path, it should return null.
    return null;
  };
}

/**
 * Returns whether it is a valid URL.
 *
 * @param url
 * @return {boolean}
 */
function isURL(url) {
  try {
    new URL(url);
  } catch (_) {
    return false;
  }

  return true;
}

/**
 * Returns a list of file candidates or an Error object.
 *
 * @param url {string} The file to import.
 * @param prev {string} The previous/calling file.
 * @param options {object}
 * @param options.environments {array} List of environment files to check for.
 * @param options.resolver {function} A custom resolver to use for resolving files.
 * @param sassOptions {object}
 * @param sassOptions.includePaths {string} The include path.
 * @return {[]} List of file candidates.
 */
function resolveCandidates(url, prev, options, sassOptions) {
  if (isURL(url)) {
    // Nothing to do.
    return [];
  }

  const environments = (options && options.environments) ? options.environments : [];

  if (!Array.isArray(environments)) {
    throw new Error('The "environments" option must be an array.');
  }

  // Custom path resolver logic.
  const resolver = options.resolver || path.resolve;

  // Resolve the include paths first.
  /* istanbul ignore next */
  const includePaths = (sassOptions && sassOptions.includePaths) ? sassOptions.includePaths.split(path.delimiter) : [];
  let directories = []
    .concat(path.dirname(prev))
    .concat(includePaths);

  let candidates = environments.flatMap(applyEnvironment(url));

  return directories
    .flatMap(
      (directory) => {
        return candidates.map(candidate => resolver(directory, candidate));
      });
}

/**
 * Returns a callback function to apply an extension prefix to a filename.
 *
 * @param fileName
 * @return {function(*): [string, string]}
 */
function applyEnvironment(fileName) {
  return (environment) => {
    const dirname = path.dirname(fileName);
    // Only scss files will be suggested by this importer to enforce a convention contrary to:
    // https://sass-lang.com/documentation/at-rules/import#finding-the-file
    // If a different extension is required, then it must be specified in the import.
    const ext = path.extname(fileName) || '.scss';
    const basename = path.basename(fileName, ext);
    return [
      // Detect partial imports.
      path.join(dirname, `_${basename}.${environment}${ext}`),
      // Detect normal imports.
      path.join(dirname, `${basename}.${environment}${ext}`)
    ];
  };
}

/**
 * Returns whether the file exists.
 *
 * @param path
 * @return {boolean}
 */
function fileExists(path) {
  try {
    fs.statSync(path);
    return true;
  } catch (err) {
    return false;
  }
}
