var contractual = require('contractual');

global.CodeMirror = require('codemirror');
global.OBLIGATIONS = require('obligations');

var inputMirror, outputMirror;


function compile (string) {
  return contractual.compiler.compile(string);
};

window.addEventListener('load', init);
document.getElementById('runner').addEventListener('click', run);

function init () {
  inputMirror = CodeMirror.fromTextArea(document.getElementById('input'), {
    lineNumbers: true,
    mode: "javascript",
    theme: 'monokai',
    tabSize: 2,
    extraKeys: {
      'Ctrl-Enter': run
    }
  });
  outputMirror = CodeMirror.fromTextArea(document.getElementById('output'), {
    lineNumbers: true,
    mode: "javascript",
    theme: 'monokai',
    tabSize: 2,
    readOnly: true
  });
  inputMirror.on('change', updateContent);
  updateContent();
}

function updateContent () {
  try {
    var source = inputMirror.getValue();
    outputMirror.setValue(compile(source));
    clearError();
  }
  catch (e) {
    displayError(e);
  }
}

function displayError (error) {
  var el = document.getElementById('errorMessage');
  el.classList.add('alert-danger');
  el.innerHTML = ''+error;
}

function clearError () {
  var el = document.getElementById('errorMessage');
  el.classList.remove('alert-danger');
  el.innerHTML = '';
}

function run () {
  try {
    var compiled = compile(inputMirror.getValue());
    (new Function ('require', compiled))(require);
  }
  catch (e) {
    displayError(e);
  }
}