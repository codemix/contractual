var estraverse = require('estraverse'),
    sideEffects = require('../side-effects'),
    ContractError = require('../error');

module.exports = postcondition;

function postcondition (ast, options) {
  pre:
    ast.type === 'LabeledStatement';
    ast.body.type === 'BlockStatement';
    options && typeof options === 'object';
  main:
    var effects = sideEffects(ast);
    if (effects.length) {
      throw new ContractError('Precondition contains side-effects! ', effects[0]);
    }
    return removeLabel(options, estraverse.replace(ast, {
      enter: enter.bind(null, options)
    }));
  post:
    Array.isArray(__result);
};

function enter (options, node, parent) {
  var statement;
  if (node.type === 'ExpressionStatement') {
    statement = {
      type: 'ExpressionStatement',
      expression: {
        type: 'CallExpression',
        callee: {
          type: 'Identifier',
          name: options.libIdentifier + '.postcondition'
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



function removeLabel (options, ast) {
  var body = ast.body.body;
  return body.concat(createReturnStatement(options));
}


function createReturnStatement (options) {
  return {
    type: 'ReturnStatement',
    argument: {
      type: 'Identifier',
      name: options.resultIdentifier
    }
  }
}