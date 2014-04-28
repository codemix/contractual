function spend (amount) {
  invariant:
    typeof amount === 'number', "First argument must be a number";
    this.balance >= 0, 'Cannot go overdrawn';
  main:
    this.balance = this.balance - amount;
    return this.balance;
}