var OBLIGATIONS = require('obligations');
var estraverse = require('estraverse');
exports.list = function (ast) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    var __result, __completed;
    // commment for the main body
    main:
        if (!__completed) {
            var names = [];
            estraverse.traverse(ast, {
                enter: function (node) {
                    names.push(node.type);
                }
            });
            if (names) {
                __result = names;
                __completed = true;
                break main;
            } else {
                __result = false;
                __completed = true;
                break main;
            }
        }
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    OBLIGATIONS.postcondition(__result.length);
    return __result;
};
exports.replaceInParent = function (node, parent, replacement) {
    OBLIGATIONS.precondition(typeof node === 'object');
    OBLIGATIONS.precondition(typeof parent === 'object');
    OBLIGATIONS.precondition(typeof replacement === 'object');
    var __result;
    var keys;
    switch (parent.type) {
    case 'WhileStatement':
    case 'ForInStatement':
    case 'ForStatement':
    case 'BlockStatement':
        keys = ['body'];
        break;
    case 'IfStatement':
        keys = [
            'consequent',
            'alternate'
        ];
        break;
    case 'SwitchCase':
        keys = ['consequent'];
        break;
    default:
        throw new Error('Cannot replace node in unsupported parent type: ' + parent.type);
    }
    var total = keys.length, found = false, args, target, key, i, index;
    for (i = 0; i < total; i++) {
        key = keys[i];
        target = parent[key];
        if (!target || typeof target !== 'object')
            continue;
        if (Array.isArray(target)) {
            if (~(index = target.indexOf(node))) {
                found = true;
                args = [
                    index,
                    1
                ].concat(replacement);
                target.splice.apply(target, args);
                break;
            }
        } else if (node === target) {
            found = true;
            if (Array.isArray(replacement)) {
                replacement = {
                    type: 'BlockStatement',
                    body: replacement
                };
            }
            parent[key] = replacement;
            break;
        }
    }
    if (!found) {
        throw new Error('Could not replace node, not found in parent!');
    }
    __result = replacement;
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    return __result;
};