var escodegen = require('escodegen');

/**
 * Generate JavaScript source code from the given AST.
 *
 * @param  {Object} ast     The AST from which to generate code.
 * @param  {Object} options The options for the code generator.
 * @return {String}         The generated JavaScript source.
 */
exports.generate = function (ast, options) {
  pre:
    ast && typeof ast === 'object';
  main:
    options = options || {};
    options.comment = true;
    return escodegen.generate(ast, options);
  post:
    typeof __result === 'string';
};

