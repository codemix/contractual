var esprima = require('esprima'),
    escodegen = require('escodegen');


/**
 * Parse some JavaScript source code, and return an
 * AST with comments attached.
 *
 * @param  {String} input   The input to parse.
 * @param  {Object} options The extra options to pass to esprima.
 * @return {Object}         The abstract syntax tree.
 */
exports.parse = function (input, options) {
  pre:
    typeof input === 'string';
  main:
    options = options || {};
    options.comment = true;
    options.tokens = true;
    options.range = true;
    options.loc = true;

    var ast = esprima.parse(input, options);

    escodegen.attachComments(ast, ast.comments, ast.tokens);

    return ast;
  post:
    __result && typeof __result === 'object';
};
