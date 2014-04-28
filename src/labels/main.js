var estraverse = require('estraverse'),
    utils = require('../utils');

module.exports = main;

/**
 * # Main Label
 * Represents the body of a function which has preconditions, post conditions or both.
 *
 *
 * @param  {Object} ast     [description]
 * @param  {Object} options [description]
 * @param  {Object} labels  [description]
 * @return {Object}         [description]
 */
function main (ast, options, labels) {
  pre: {
    ast.type === 'LabeledStatement';
    ast.body.type === 'BlockStatement';
    options && typeof options === 'object';
    options.resultIdentifier;
  }
  main: {
    if (!labels.post) {
      return ast.body.body;
    }

    var returns = [],
        canOptimise = false;
    estraverse.traverse(ast, {
      enter: function (node, parent) {
        if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
          this.skip();
        }
        else if (node.type === 'ReturnStatement') {
          returns.push([node, parent]);
        }
      }
    });
    return processLabel(ast, options, returns);
  }
  post: {
    Array.isArray(__result);
  }
};

function processLabel (node, options, returns) {
  var canOptimise = returns.length === 1 && returns[0][1] === node.body,
      contents = [];

  if (returns.length) {
    returns.forEach(function (item) {
      replaceReturnStatement(options, item[0], item[1], !canOptimise);
    });
  }
  contents.push(createVarStatement(options, node));
  if (canOptimise) {
    contents = contents.concat(node.body.body);
  }
  else {
    contents.push(node);
  }
  return contents;
}



function createIfStatement (node, options) {
  return {
    type: 'IfStatement',
    test: {
      type: 'UnaryExpression',
      operator: '!',
      argument: {
        type: 'Identifier',
        name: options.completedIdentifier
      },
      prefix: true
    },
    consequent: node.body
  };
}


function replaceReturnStatement (options, node, parent, addBreak) {
  var args = [createInterimExpressionStatement(options, node)];
  if (addBreak) {
    args.push(createBreakStatement(options));
  }
  utils.replaceInParent(node, parent, args);
}



function createVarStatement (options, ast, addCompleted) {
  var statement = {
    type: 'VariableDeclaration',
    declarations: [
      {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
          name: options.resultIdentifier
        },
        init: null
      }
    ],
    kind: 'var'
  };

  statement.leadingComments = ast.leadingComments;
  statement.trailingComments = ast.trailingComments;

  return statement;
}

function createInterimExpressionStatement (options, node) {
  return {
    type: 'ExpressionStatement',
    expression: {
      type: 'AssignmentExpression',
      operator: '=',
      left: {
        type: 'Identifier',
        name: options.resultIdentifier
      },
      right: node.argument || {
        type: 'Identifier',
        name: 'undefined'
      }
    },
    range: node.range,
    loc: node.loc,
    leadingComments: node.leadingComments,
    trailingComments: node.trailingComments
  };
}


function createBreakStatement (options) {
  return {
    type: 'BreakStatement',
    label: {
      type: 'Identifier',
      name: 'main'
    }
  };
}
