var OBLIGATIONS = require('obligations');
function warn(message) {
    OBLIGATIONS.precondition(typeof message === 'string');
    alert('Warning!\n' + message);
}