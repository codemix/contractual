var OBLIGATIONS = require('obligations');
var parser = require('../parser'), processor = require('../processor'), codegen = require('../codegen'), reader = require('./reader'), writer = require('./writer');
/**
 * Compile all the files in the given directories.
 *
 * @param   {String[]} dirs    An array of directories.
 * @param   {Object}   options The options for the compiler.
 * @promise {String[]}         An array of filenames that were written.
 */
function all(dirs, options) {
    return reader.load(dirs).then(function (sources) {
        var compiled = generateSources(sources, options);
        return writer.prepare(compiled, options).then(function (targets) {
            return [
                compiled,
                targets
            ];
        });
    }).spread(function (sources, targets) {
        return writer.write(sources, targets, options);
    });
}
;
/**
 * Compile the given string and returned compiled JavaScript source.
 *
 * @param    {String} input   The JavaScript source to compile.
 * @param    {Object} options The options for the compiler.
 * @promise  {String}         The compiled JavaScript.
 */
function compile(input, options) {
    OBLIGATIONS.precondition(input.length, 'Cannot compile empty string');
    OBLIGATIONS.precondition(typeof input === 'string');
    var __result;
    var ast = parser.parse(input), processed = processor.process(ast, options || {});
    __result = codegen.generate(processed);
    OBLIGATIONS.postcondition(typeof __result === 'string');
    OBLIGATIONS.postcondition(__result.length);
    return __result;
}
;
/**
 * Generate code for the given map of filenames to contents.
 *
 * @param  {Object} sources The map of filenames to sources.
 * @param  {Object} options The options for the compiler.
 * @return {Object}         The map of target filenames to contents.
 */
function generateSources(sources, options) {
    OBLIGATIONS.precondition(sources && typeof sources === 'object');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    var compiled = {}, filenames = Object.keys(sources), total = filenames.length, filename, i;
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