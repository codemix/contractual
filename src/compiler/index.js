var parser = require('../parser'),
    processor = require('../processor'),
    codegen = require('../codegen'),
    reader = require('./reader'),
    writer = require('./writer');


/**
 * Compile all the files in the given directories.
 *
 * @param   {String[]} dirs    An array of directories.
 * @param   {Object}   options The options for the compiler.
 * @promise {String[]}         An array of filenames that were written.
 */
function all (dirs, options) {
  return reader.load(dirs)
  .then(function (sources) {
    var compiled = generateSources(sources, options);
    return writer.prepare(compiled, options)
    .then(function (targets) {
      return [compiled, targets];
    })
  })
  .spread(function (sources, targets) {
    return writer.write(sources, targets, options);
  });
};


/**
 * Compile the given string and returned compiled JavaScript source.
 *
 * @param    {String} input   The JavaScript source to compile.
 * @param    {Object} options The options for the compiler.
 * @promise  {String}         The compiled JavaScript.
 */
function compile (input, options) {
  pre:
    input.length, "Cannot compile empty string";
    typeof input === 'string';
  main:
    var ast = parser.parse(input),
        processed = processor.process(ast, options || {});
    return codegen.generate(processed);
  post:
    typeof __result === 'string';
    __result.length;
};


/**
 * Generate code for the given map of filenames to contents.
 *
 * @param  {Object} sources The map of filenames to sources.
 * @param  {Object} options The options for the compiler.
 * @return {Object}         The map of target filenames to contents.
 */
function generateSources (sources, options) {
  pre:
    sources && typeof sources === 'object';
    options && typeof options === 'object';
  main:
    var compiled = {},
        filenames = Object.keys(sources),
        total = filenames.length,
        filename, i;

    for (i = 0; i < total; i++) {
      filename = filenames[i];
      compiled[filename] = compile(sources[filename], options);
    }

    return compiled;
}


exports.compile = compile;
exports.generateSources = generateSources;
exports.reader = reader;
exports.writer = writer;
exports.all = all;