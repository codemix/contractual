var OBLIGATIONS = require('obligations');
function divide(a, b) {
    OBLIGATIONS.precondition(typeof a === 'number');
    OBLIGATIONS.precondition(typeof b === 'number');
    OBLIGATIONS.precondition(b !== 0);
    var __result;
    __result = a / b;
    OBLIGATIONS.postcondition(__result < a);
    return __result;
}