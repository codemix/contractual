var estraverse = require('estraverse'),
    sideEffects = require('../side-effects'),
    ContractError = require('../error');

module.exports = precondition;

function precondition (ast, options) {
  pre:
    ast.type === 'LabeledStatement';
    ast.body.type === 'BlockStatement';
    options && typeof options === 'object';
  main:
    var effects = sideEffects(ast);
    if (effects.length) {
      throw new ContractError('Precondition contains side-effects! ', effects[0]);
    }

    estraverse.replace(ast, {
      enter: enter.bind(null, options)
    });
    var body = ast.body.body,
        first = body[0];
    if (!first) {
      first = {type: 'EmptyStatement'};
      body.unshift(first);
    }
    if (ast.leadingComments) {
      first.leadingComments = ast.leadingComments.concat(first.leadingComments || []);
    }
    return body;
  post:
    Array.isArray(__result);
};

function enter (options, node, parent) {
  var statement;
  if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
    this.skip();
  }
  else if (node.type === 'ExpressionStatement') {
    statement = {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: options.libIdentifier + '.precondition'
        },
        arguments: []
      },
      range: node.range,
      loc: node.loc
    };
    if (node.expression.type === 'SequenceExpression') {
      statement.expression.arguments = node.expression.expressions;
    }
    else {
      statement.expression.arguments.push(node.expression);
    }
    return statement;
  }
}
