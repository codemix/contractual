var Promise = require('bluebird'),
    fs = Promise.promisifyAll(require('fs')),
    mkdirp = Promise.promisify(require('mkdirp')),
    path = require('path');

/**
 * Prepare to write the given sources and return a map of target files to source files.
 *
 * @param  {Object} sources The map of filenames to contents.
 * @param  {Object} options The options for the writer.
 * @promise {Object}        A map of target filenames to source filenames.
 */
exports.prepare = function (sources, options) {
  pre:
    sources && typeof sources === 'object';
    options && typeof options === 'object';
  main:
    var targets = exports.resolveTargets(sources, options),
        dirs = Object.keys(targets).reduce(function (dirs, item) {
          var last = dirs[dirs.length - 1];
          item = path.dirname(item);
          if (last !== item) {
            dirs.push(item);
          }
          return dirs;
        }, [])
        .sort();

    return Promise.map(dirs, function (item) {
      return mkdirp(item);
    })
    .then(function () {
      return targets;
    });
};

/**
 * Write the given sources to their targets.
 *
 * > Note: Assumes that `prepare()` has already been called.
 *
 * @param   {Object}   sources  A map of source filenames to compiled contents.
 * @param   {Object}   targets  A map of target filenames to source filenames.
 * @param   {Object}   options  The options for the writer.
 * @promise {String[]}          An array of filenames that were written.
 */
exports.write = function (sources, targets, options) {
  pre:
    sources && typeof sources === 'object';
    targets && typeof targets === 'object';
    options && typeof options === 'object';
  main:
    var filenames = Object.keys(targets);
    return Promise.map(filenames, function (filename) {
      return fs.writeFileAsync(filename, sources[targets[filename]]).return(filename);
    });
};

/**
 * Resolve the source files to their target files.
 *
 * @param  {Object} sources The source files.
 * @param  {Object} options The options for the writer.
 * @return {Object}         A map of target filenames to source filenames.
 */
exports.resolveTargets = function (sources, options) {
  pre:
    sources && typeof sources === 'object';
    options && typeof options === 'object';
    options.dir && typeof options.dir === 'string';
  main:
    var filenames = Object.keys(sources),
        prefix = commonPathPrefix(filenames),
        total = filenames.length,
        targets = {},
        filename, i;

    for (i = 0; i < total; i++) {
      filename = filenames[i];
      targets[resolveTarget(filename, prefix, options)] = filename;
    }

    return targets;
  post:
    typeof __result === 'object';
};

/**
 * Given an array of filenames, find the longest common path prefix.
 *
 * @param  {String[]} filenames The filenames
 * @return {String}             The longest common file path.
 */
function commonPathPrefix (filenames) {
  var common = filenames
  .sort()
  .reverse()
  .reduce(function (items, item) {
    var last = items[items.length -1];
    item = path.dirname(item);
    if (last !== item) {
      items.push(item);
    }
    return items;
  }, [])
  .reduce(function (common, filename) {
    var parts = filename.split('/'),
        total, item, i;

    if (!common) {
      return parts;
    }

    total = common.length;

    for (i = 0; i < total; i++) {
      item = common[i];
      if (item !== parts[i]) {
        return common.slice(0, i);
      }
    }
    return common;
  }, false);

  common = common || [];
  return path.sep + common.join(path.sep);
}

/**
 * Given a source filename, and a common path prefix, return the target filename.
 *
 * @param  {String} filename The source filename.
 * @param  {String} prefix   The longest common path prefix.
 * @param  {Object} options  The options for the writer.
 * @return {String}          The target filename to write to.
 */
function resolveTarget (filename, prefix, options) {
  pre:
    filename && typeof filename === 'string';
    prefix && typeof prefix === 'string';
    options && typeof options === 'object';
    options.dir && typeof options.dir === 'string';
  main:
    var relative = filename.slice(prefix.length);
    return path.join(options.dir, relative);
  post:
    typeof __result === 'string';
    __result.length > 1;
}