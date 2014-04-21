var escodegen = require('escodegen');

function ContractError (message, ast) {
  this.name = 'ContractError';
  this.message = message || 'Unspecified contract error!';

  if (ast) {
    this.ast = ast;
    this.prepareAST(ast);
  }

  Error.captureStackTrace(this, ContractError);
}

ContractError.prototype = Object.create(Error.prototype);
ContractError.prototype.constructor = ContractError;

ContractError.prototype.prepareAST = function (ast) {
  this.message += '\n\n' + escodegen.generate(ast).split('\n').map(function (line) {
    return '    ' + line;
  }) + '\n';
};

module.exports = ContractError;
