'use strict';
var estraverse = require('estraverse');

var defaults = {
  pre: require('./labels/pre'),
  post: require('./labels/post'),
  main: require('./labels/main'),
  invariant: require('./labels/invariant')
};

/**
 * Process an AST and return the modified structure.
 *
 * @param  {Object} ast     The AST to process.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed AST.
 */
exports.process = function (ast, options) {
  invariant:
    ast && typeof ast === 'object';
  main:
    options = options || {};
    options.libIdentifier = options.libIdentifier || 'OBLIGATIONS';
    options.resultIdentifier = options.resultIdentifier || '__result';
    options.completedIdentifier = options.completedIdentifier || '__completed';
    options.supported = options.supported || defaults;
    options.global = options.global || false;
    options.require = options.require || 'obligations';
    return processProgram(ast, options);
  post:
    __result && typeof __result === 'object';
};

/**
 * Process a program.
 *
 * @param  {Object} ast     The program to process.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed AST.
 */
function processProgram (ast, options) {
  pre:
    ast && typeof ast === 'object';
    ast.type === 'Program';
    options && typeof options === 'object';
  main:
    var total = processFunctions(ast, options)[1];
    if (total && !options.global) {
      if (ast.body[0].type === 'ExpressionStatement' && ast.body[0].expression.value === 'use strict') {
        ast.body.splice(1, 0, createRequireStatement(options));
      }
      else {
        ast.body.unshift(createRequireStatement(options));
      }
    }
    // regular expression are being hammered in some cases, this fixes that.
    // but it's a bandage. The root cause is not clear, it seems to be an issue with esprima.
    estraverse.traverse(ast, {
      leave: function (node) {
        var matches;
        if (node.type === 'Literal' && (matches = /^\/(.*)\/([gimy]*)$/.exec(node.raw))) {
          node.value = new RegExp(matches[1], matches[2] || '');
        }
      }
    })
    return ast;
  post:
    ast && ast.type === 'Program';
}

/**
 * Create a require statement to be inserted at the top of the program.
 *
 * @param  {Object} options [description]
 * @return {Object}         [description]
 */
function createRequireStatement (options) {
  pre:
    options && typeof options === 'object';
  main:
    return {
      type: 'VariableDeclaration',
      kind: 'var',
      declarations: [
        {
          type: 'VariableDeclarator',
          id: {
            type: 'Identifier',
            name: options.libIdentifier
          },
          init: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'require'
            },
            arguments: [
              {
                type: 'Literal',
                value: options.require,
                raw: JSON.stringify(options.require)
              }
            ]
          }
        }
      ]
    };
}


/**
 * Processes `FunctionDeclaration` and `FunctionExpression` instances.
 * These are the only structures which may contain contracts.
 *
 * @param  {Object} ast     The AST to process.
 * @param  {Object} options The options for the processor.
 * @return {Array}          The processed AST and the number of functions that contain contracts.
 */
function processFunctions (ast, options) {
  pre:
    ast && typeof ast === 'object';
  main:
    var total = 0;
    estraverse.replace(ast, {
      enter: function (node) {
        var result;
        if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
          result = collectLabels(node, options);
          if (result[1].length) {
            total++;
            return cleanup(result[0]);
          }
          else {
            return result[0];
          }
        }
      }
    });
    return [ast, total];
  post:
    Array.isArray(__result);
    __result[0] && typeof __result[0] === 'object';
}

/**
 * Collects all the `LabeledStatement` instances in the tree which
 * have labels that match our supported contract types.
 *
 * Nodes that follow a label are then added to a new  temporary `BlockStatement`
 * which forms the body of the label.
 *
 *
 * @param  {Object} ast     The AST to process.
 * @param  {Object} options The options for the processor.
 * @return {Array}          The processed AST and an array containing any collected, supported labels.
 */
function collectLabels (ast, options) {
  pre:
    ast && typeof ast === 'object';
    ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression';
    options && typeof options === 'object';
  main:
    var state = {
      ast: ast,
      inLabel: false,
      parent: null,
      labels: []
    };
    estraverse.replace(ast, {
      enter: enterCollect.bind(null, options, state),
      leave: leaveCollect.bind(null, options, state)
    });
    return [ast, state.labels];
  post:
    Array.isArray(__result);
}

/**
 * Invoked when `estraverse` enters a node during the collection phase.
 *
 * @param  {Object} options The options for the processor.
 * @param  {Object} state   The current state of the processor.
 * @param  {Object} node    The node being processed.
 * @param  {Object} parent  The parent node.
 * @return {Object}         The node, or a special value indicating that this node should be skipped.
 */
function enterCollect (options, state, node, parent) {
  pre:
    options && typeof options === 'object';
    state && typeof state === 'object';
  main:
    if (node !== state.ast && (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration')) {
      return estraverse.VisitorOption.Skip;
    }
    else if (node.type !== 'LabeledStatement' && state.inLabel && parent === state.parent) {
      return estraverse.VisitorOption.Skip;
    }
    else {
      return node;
    }
  post:
    __result && typeof __result === 'object';
}

/**
 * Invoked when `estraverse` leaves a node during the collection phase.
 *
 * @param  {Object} options The options for the processor.
 * @param  {Object} state   The current state of the processor.
 * @param  {Object} node    The node being processed.
 * @param  {Object} parent  The parent node.
 * @return {Object}         The node, processed.
 */
function leaveCollect (options, state, node, parent) {
  pre:
    options && typeof options === 'object';
    state && typeof state === 'object';
  main:
    if (node.type === 'LabeledStatement' && options.supported[node.label.name]) {
      state.inLabel = node;
      if (!node.body || node.body.type !== 'BlockStatement') {
        node.body = {
          type: 'BlockStatement',
          body: node.body ? [node.body] : []
        };
      }
      state.parent = parent;
      state.labels.push(node);
    }
    else if (state.labels.length && node === state.ast) {
      node = processFunctionBody(node, options);
    }
    else if (state.inLabel && parent === state.parent) {
      state.inLabel.body.body.push(node);
      return {
        type: 'EmptyStatement',
        deleteMe: true
      };
    }
    return node;
  post:
    __result && typeof __result === 'object';
}

/**
 * Process a function body, after labels have been collected.
 *
 * @param  {Object} ast     The `FunctionDeclaration` or `FunctionExpression` to process.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed node.
 */
function processFunctionBody (ast, options) {
  pre:
    ast && typeof ast === 'object';
    ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression';
  main:
    return estraverse.replace(ast, {
      enter: function (node) {
        if (node.type === 'BlockStatement') {
          return processBlockStatement(node, ast, options);
        }
      }
    });
  post:
    __result && typeof __result === 'object';
}


/**
 * Process a block statement in a function body, after labels have been collected.
 *
 * @param  {Object} ast     The `BlockStatement` to process.
 * @param  {Object} parent  The `FunctionExpression` or `FunctionDeclaration` that contains the block.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed node.
 */
function processBlockStatement (ast, parent, options) {
  pre:
    ast && typeof ast === 'object';
    ast.type === 'BlockStatement';
    parent && typeof parent === 'object';
    parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression';
    options && typeof options === 'object';
    typeof options.supported === 'object';
  main:
    var labels = {};
    return estraverse.replace(ast, {
      enter: function (node, parent) {
        if (node !== ast && (parent !== ast || node.type !== 'LabeledStatement' || !options.supported[node.label.name])) {
          this.skip();
        }
        else if (node.type === 'LabeledStatement') {
          labels[node.label.name] = node;
        }
      },
      leave: function (node) {
        if (node === ast) {
          return processLabels(ast, parent, labels, options);
        }
      }
    });
  post:
    __result && typeof __result === 'object';
    __result.type === ast.type;
}

/**
 * Process a list of labels that are contained within the given `BlockStatement`.
 *
 * @param  {Object}   ast     The `BlockStatement` that contains the labels.
 * @param  {Object}   parent  The `FunctionExpression` or `FunctionDeclaration` that contains the label.
 * @param  {Object}   labels  The labels to process.
 * @param  {Object}   options The options for the processor.
 * @return {Object}           The processed AST.
 */
function processLabels (ast, parent, labels, options) {
  pre:
    ast && typeof ast === 'object';
    ast.type === 'BlockStatement';
    labels && typeof labels === 'object';
    parent && typeof parent === 'object';
    parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression';
    options && typeof options === 'object';
    typeof options.supported === 'object';
  main:
    var keys = Object.keys(labels),
        total = keys.length,
        key, index, label, i;

    for (i = 0; i < total; i++) {
      key = keys[i];
      label = labels[key];
      index = ast.body.indexOf(label);
      if (~index) {
        ast.body.splice.apply(ast.body, [index, 1].concat(processLabel(label, labels, parent, options)));
      }
    }
    return ast;
  post:
    __result && typeof __result === 'object';
}

/**
 * Process a magic label.
 *
 * @param  {Object}     ast     The `LabeledStatement` to process.
 * @param  {Object}     labels  The map of label names to labels.
 * @param  {Object}     parent  The `FunctionExpression` or `FunctionDeclaration` that contains the label.
 * @param  {Object}     options The options for the processor.
 * @return {Object[]}           The nodes that should be injected in place of the `LabeledStatement`.
 */
function processLabel (ast, labels, parent, options) {
  pre:
    ast.type === 'LabeledStatement';
    ast.body.type === 'BlockStatement';
    parent && typeof parent === 'object';
    parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression';
    options && typeof options === 'object';
    typeof options.supported === 'object';
  main:
    if (typeof options.supported[ast.label.name] === 'function') {
      return options.supported[ast.label.name](ast, options, labels, parent);
    }
    else {
      return ast.body.body;
    }
  post:
    Array.isArray(__result);
}


/**
 * Remove deletable nodes from the given AST.
 *
 * @param  {Object|Object[]} ast The node, or list of nodes to cleanup.
 * @return {Object|Object[]}     The cleaned up node(s).
 */
function cleanup (ast) {
  if (!ast || typeof ast !== 'object') {
    return ast;
  }
  else if (Array.isArray(ast)) {
    return ast
    .filter(function (child) {
      return !(child && child.deleteMe);
    })
    .map(cleanup);
  }

  var filtered = {},
      keys = Object.keys(ast),
      total = keys.length,
      key, value, i;
  for (i = 0; i < total; i++) {
    key = keys[i];
    value = ast[key];
    if (value && typeof value === 'object') {
      value = cleanup(value);
    }
    filtered[key] = value;
  }
  return filtered;
}
