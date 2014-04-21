var OBLIGATIONS = require('obligations');
var estraverse = require('estraverse');
module.exports = postcondition;
function postcondition(ast, options) {
    OBLIGATIONS.precondition(ast.type === 'LabeledStatement');
    OBLIGATIONS.precondition(ast.body.type === 'BlockStatement');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    var __result;
    __result = removeLabel(options, estraverse.replace(ast, { enter: enter.bind(null, options) }));
    OBLIGATIONS.postcondition(Array.isArray(__result));
    return __result;
}
;
function enter(options, node, parent) {
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
        } else {
            statement.expression.arguments.push(node.expression);
        }
        return statement;
    }
}
function removeLabel(options, ast) {
    var body = ast.body.body;
    return body.concat(createReturnStatement(options));
}
function createReturnStatement(options) {
    return {
        type: 'ReturnStatement',
        argument: {
            type: 'Identifier',
            name: options.resultIdentifier
        }
    };
}