var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    path = require('path');

/**
 * Load all the files in the given source directories.
 *
 * @param   {String|String[]} sources The directories / filenames to load.
 * @promise {Object}                  A map of filenames to sources.
 */
exports.load = function (sources) {
  return exports
  .find(sources)
  .reduce(function (files, filename) {
    return exports.read(filename)
    .then(function (contents) {
      files[filename] = contents;
      return files;
    })
  }, {});
};

/**
 * Read the given source file.
 *
 * @param   {String} source The filename to load.
 * @promise {String}        The loaded file contents.
 */
exports.read = function (source) {
  return fs.readFileAsync(source, 'utf8');
};


/**
 * Find all the files in the given source directories.
 *
 * @param   {String|String[]} sources The source directories and/or files to traverse.
 * @promise {String[]}                The found source files.
 */
exports.find = function (sources) {
  if (!Array.isArray(sources)) {
    sources = [sources];
  }
  return Promise.map(sources, function (source) {
    return fs.statAsync(source)
    .then(function (stat) {
      if (stat.isDirectory()) {
        return findFiles(source)
      }
      else {
        return [source];
      }
    })
  })
  .reduce(function flatten (files, file) {
    if (Array.isArray(file)) {
      return file.reduce(flatten, files);
    }
    else {
      files.push(file);
      return files;
    }
  }, [])
  .filter(function (file) {
    return file.slice(-3) === '.js';
  });
};


/**
 * Find all the files in the given directory.
 */
function findFiles (source) {
  return fs.readdirAsync(source)
  .map(function (item) {
    item = path.join(source, item);
    return fs.statAsync(item)
    .then(function (stat) {
      if (stat.isDirectory()) {
        return findFiles(item);
      }
      else if (stat.isFile()) {
        return item;
      }
    });
  });
}