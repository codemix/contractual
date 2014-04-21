var OBLIGATIONS = require('obligations');
function divide(a, b) {
    OBLIGATIONS.precondition(typeof a === 'number', 'First argument must be a number');
    OBLIGATIONS.precondition(typeof b === 'number', 'Second argument must be a number');
    OBLIGATIONS.precondition(b !== 0, 'May not divide by zero');
    var __result;
    __result = a / b;
    OBLIGATIONS.postcondition(__result < a, 'Result must always be less than the first argument');
    return __result;
}