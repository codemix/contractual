var fs = require('fs'),
    esprima = require('esprima');

global.should = require('should');
global.expect = require('expect.js');

global.LIB = require('../lib');
global.SRC = require('../src');

global.PARSE = function (source) {
  return LIB.parser.parse(''+source);
};

global.PROCESS = function (source) {
  return LIB.processor.process(PARSE(source), {
    global: true
  });
};

global.GENERATE = function (ast) {
  return LIB.codegen.generate(ast);
};

global.LIST = function (ast) {
  return LIB.utils.list(ast);
};

global.COMPARE = function (a, b) {
  var processedA = PROCESS(a.toString()),
      processedB = PARSE(b.toString());

  var generatedA = GENERATE(processedA),
      generatedB = GENERATE(processedB);

  var parsedA = PARSE(generatedA),
      parsedB = PARSE(generatedB);
  try {
    parsedA.should.eql(parsedB);
  }
  catch (e) {
    generatedA.should.equal(generatedB);
  }
};