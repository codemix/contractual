var OBLIGATIONS = require('obligations');
var escodegen = require('escodegen');
/**
 * Generate JavaScript source code from the given AST.
 *
 * @param  {Object} ast     The AST from which to generate code.
 * @param  {Object} options The options for the code generator.
 * @return {String}         The generated JavaScript source.
 */
exports.generate = function (ast, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    var __result;
    options = options || {};
    options.comment = true;
    __result = escodegen.generate(ast, options);
    OBLIGATIONS.postcondition(typeof __result === 'string');
    return __result;
};