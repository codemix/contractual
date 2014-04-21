var estraverse = require('estraverse');

exports.list = function (ast) {
  pre: {
    ast && typeof ast === 'object';
  }
  // commment for the main body
  main: {
    var names = [];
    estraverse.traverse(ast, {
      enter: function (node) {
        names.push(node.type);
      }
    });
    if (names)
      return names;
    else
      return false;
  }
  post: {
    __result && typeof __result === 'object';
    __result.length;
  }
};


exports.replaceInParent = function (node, parent, replacement) {
  pre:
    typeof node === 'object';
    typeof parent === 'object';
    typeof replacement === 'object';
  main:
    var keys;
    switch (parent.type) {
      case 'WhileStatement':
      case 'ForInStatement':
      case 'ForStatement':
      case 'BlockStatement':
        keys = ['body'];
        break;
      case 'IfStatement':
        keys = ['consequent', 'alternate'];
        break;
      case 'SwitchCase':
        keys = ['consequent'];
        break;
      default:
        throw new Error('Cannot replace node in unsupported parent type: ' + parent.type);
    }

    var total = keys.length,
        found = false,
        args, target, key, i, index;

    for (i = 0; i < total; i++) {
      key = keys[i];
      target = parent[key];
      if (!target || typeof target !== 'object') continue;
      if (Array.isArray(target)) {
        if (~(index = target.indexOf(node))) {
          found = true;
          args = [index, 1].concat(replacement);
          target.splice.apply(target, args);
          break;
        }
      }
      else if (node === target) {
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
    return replacement;
  post:
    __result && typeof __result === 'object';
};