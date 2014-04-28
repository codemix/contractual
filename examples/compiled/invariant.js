var OBLIGATIONS = require('obligations');
function spend(amount) {
    OBLIGATIONS.invariant(typeof amount === 'number', 'First argument must be a number');
    OBLIGATIONS.invariant(this.balance >= 0, 'Cannot go overdrawn');
    var __result;
    this.balance = this.balance - amount;
    __result = this.balance;
    OBLIGATIONS.invariant(typeof amount === 'number', 'First argument must be a number');
    OBLIGATIONS.invariant(this.balance >= 0, 'Cannot go overdrawn');
    return __result;
}