var OBLIGATIONS = require('obligations');
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
    OBLIGATIONS.invariant(ast && typeof ast === 'object');
    var __result;
    options = options || {};
    options.libIdentifier = options.libIdentifier || 'OBLIGATIONS';
    options.resultIdentifier = options.resultIdentifier || '__result';
    options.completedIdentifier = options.completedIdentifier || '__completed';
    options.supported = options.supported || defaults;
    options.global = options.global || false;
    options.require = options.require || 'obligations';
    __result = processProgram(ast, options);
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    OBLIGATIONS.invariant(ast && typeof ast === 'object');
    return __result;
};
/**
 * Process a program.
 *
 * @param  {Object} ast     The program to process.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed AST.
 */
function processProgram(ast, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    OBLIGATIONS.precondition(ast.type === 'Program');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    var __result;
    var total = processFunctions(ast, options)[1];
    if (total && !options.global) {
        ast.body.unshift(createRequireStatement(options));
    }
    // regular expression haves are being hammered in some cases, this fixes that.
    // but it's a bandage. The root cause is not clear, it seems to be an issue with esprima.
    estraverse.traverse(ast, {
        leave: function (node) {
            var matches;
            if (node.type === 'Literal' && (matches = /^\/(.*)\/([gimy]*)$/.exec(node.raw))) {
                node.value = new RegExp(matches[1], matches[2] || '');
            }
        }
    });
    __result = ast;
    OBLIGATIONS.postcondition(ast && ast.type === 'Program');
    return __result;
}
/**
 * Create a require statement to be inserted at the top of the program.
 *
 * @param  {Object} options [description]
 * @return {Object}         [description]
 */
function createRequireStatement(options) {
    OBLIGATIONS.precondition(options && typeof options === 'object');
    return {
        type: 'VariableDeclaration',
        kind: 'var',
        declarations: [{
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
                    arguments: [{
                            type: 'Literal',
                            value: options.require,
                            raw: JSON.stringify(options.require)
                        }]
                }
            }]
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
function processFunctions(ast, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    var __result;
    var total = 0;
    estraverse.replace(ast, {
        enter: function (node) {
            var result;
            if (node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression') {
                result = collectLabels(node, options);
                if (result[1].length) {
                    total++;
                    return cleanup(result[0]);
                } else {
                    return result[0];
                }
            }
        }
    });
    __result = [
        ast,
        total
    ];
    OBLIGATIONS.postcondition(Array.isArray(__result));
    OBLIGATIONS.postcondition(__result[0] && typeof __result[0] === 'object');
    return __result;
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
function collectLabels(ast, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    OBLIGATIONS.precondition(ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    var __result;
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
    __result = [
        ast,
        state.labels
    ];
    OBLIGATIONS.postcondition(Array.isArray(__result));
    return __result;
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
function enterCollect(options, state, node, parent) {
    OBLIGATIONS.precondition(options && typeof options === 'object');
    OBLIGATIONS.precondition(state && typeof state === 'object');
    var __result;
    main: {
        if (node !== state.ast && (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration')) {
            __result = estraverse.VisitorOption.Skip;
            break main;
        } else if (node.type !== 'LabeledStatement' && state.inLabel && parent === state.parent) {
            __result = estraverse.VisitorOption.Skip;
            break main;
        } else {
            __result = node;
            break main;
        }
    }
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    return __result;
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
function leaveCollect(options, state, node, parent) {
    OBLIGATIONS.precondition(options && typeof options === 'object');
    OBLIGATIONS.precondition(state && typeof state === 'object');
    var __result;
    main: {
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
        } else if (state.labels.length && node === state.ast) {
            node = processFunctionBody(node, options);
        } else if (state.inLabel && parent === state.parent) {
            state.inLabel.body.body.push(node);
            __result = {
                type: 'EmptyStatement',
                deleteMe: true
            };
            break main;
        }
        __result = node;
        break main;
    }
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    return __result;
}
/**
 * Process a function body, after labels have been collected.
 *
 * @param  {Object} ast     The `FunctionDeclaration` or `FunctionExpression` to process.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed node.
 */
function processFunctionBody(ast, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    OBLIGATIONS.precondition(ast.type === 'FunctionDeclaration' || ast.type === 'FunctionExpression');
    var __result;
    __result = estraverse.replace(ast, {
        enter: function (node) {
            if (node.type === 'BlockStatement') {
                return processBlockStatement(node, ast, options);
            }
        }
    });
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    return __result;
}
/**
 * Process a block statement in a function body, after labels have been collected.
 *
 * @param  {Object} ast     The `BlockStatement` to process.
 * @param  {Object} parent  The `FunctionExpression` or `FunctionDeclaration` that contains the block.
 * @param  {Object} options The options for the processor.
 * @return {Object}         The processed node.
 */
function processBlockStatement(ast, parent, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    OBLIGATIONS.precondition(ast.type === 'BlockStatement');
    OBLIGATIONS.precondition(parent && typeof parent === 'object');
    OBLIGATIONS.precondition(parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    OBLIGATIONS.precondition(typeof options.supported === 'object');
    var __result;
    var labels = {};
    __result = estraverse.replace(ast, {
        enter: function (node, parent) {
            if (node !== ast && (parent !== ast || node.type !== 'LabeledStatement' || !options.supported[node.label.name])) {
                this.skip();
            } else if (node.type === 'LabeledStatement') {
                labels[node.label.name] = node;
            }
        },
        leave: function (node) {
            if (node === ast) {
                return processLabels(ast, parent, labels, options);
            }
        }
    });
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    OBLIGATIONS.postcondition(__result.type === ast.type);
    return __result;
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
function processLabels(ast, parent, labels, options) {
    OBLIGATIONS.precondition(ast && typeof ast === 'object');
    OBLIGATIONS.precondition(ast.type === 'BlockStatement');
    OBLIGATIONS.precondition(labels && typeof labels === 'object');
    OBLIGATIONS.precondition(parent && typeof parent === 'object');
    OBLIGATIONS.precondition(parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    OBLIGATIONS.precondition(typeof options.supported === 'object');
    var __result;
    var keys = Object.keys(labels), total = keys.length, key, index, label, i;
    for (i = 0; i < total; i++) {
        key = keys[i];
        label = labels[key];
        index = ast.body.indexOf(label);
        if (~index) {
            ast.body.splice.apply(ast.body, [
                index,
                1
            ].concat(processLabel(label, labels, parent, options)));
        }
    }
    __result = ast;
    OBLIGATIONS.postcondition(__result && typeof __result === 'object');
    return __result;
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
function processLabel(ast, labels, parent, options) {
    OBLIGATIONS.precondition(ast.type === 'LabeledStatement');
    OBLIGATIONS.precondition(ast.body.type === 'BlockStatement');
    OBLIGATIONS.precondition(parent && typeof parent === 'object');
    OBLIGATIONS.precondition(parent.type === 'FunctionDeclaration' || parent.type === 'FunctionExpression');
    OBLIGATIONS.precondition(options && typeof options === 'object');
    OBLIGATIONS.precondition(typeof options.supported === 'object');
    var __result;
    main: {
        if (typeof options.supported[ast.label.name] === 'function') {
            __result = options.supported[ast.label.name](ast, options, labels, parent);
            break main;
        } else {
            __result = ast.body.body;
            break main;
        }
    }
    OBLIGATIONS.postcondition(Array.isArray(__result));
    return __result;
}
/**
 * Remove deletable nodes from the given AST.
 *
 * @param  {Object|Object[]} ast The node, or list of nodes to cleanup.
 * @return {Object|Object[]}     The cleaned up node(s).
 */
function cleanup(ast) {
    if (!ast || typeof ast !== 'object') {
        return ast;
    } else if (Array.isArray(ast)) {
        return ast.filter(function (child) {
            return !(child && child.deleteMe);
        }).map(cleanup);
    }
    var filtered = {}, keys = Object.keys(ast), total = keys.length, key, value, i;
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