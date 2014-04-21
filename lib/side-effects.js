var estraverse = require('estraverse');
var MUTATORS = {
        UpdateExpression: true,
        AssignmentExpression: true,
        VariableDeclaration: true,
        FunctionDeclaration: true,
        UnaryExpression: { operator: 'delete' }
    };
function check(ast) {
    var effects = [];
    estraverse.traverse(ast, {
        enter: function (node) {
            var mutator = MUTATORS[node.type], keys, total, key, i;
            if (!mutator)
                return;
            if (mutator === true) {
                effects.push(node);
            } else {
                keys = Object.keys(mutator);
                total = keys.length;
                for (i = 0; i < total; i++) {
                    key = keys[i];
                    if (node[key] !== mutator[key]) {
                        return;
                    }
                }
                effects.push(node);
            }
        }
    });
    return effects;
}
module.exports = check;