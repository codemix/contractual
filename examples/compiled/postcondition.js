var OBLIGATIONS = require('obligations');
function items(a, b) {
    var __result;
    var c = [];
    if (a) {
        c.push(a);
    }
    if (b) {
        c.push(b);
    }
    __result = c;
    OBLIGATIONS.postcondition(Array.isArray(__result));
    OBLIGATIONS.postcondition(__result.length > 0);
    return __result;
}