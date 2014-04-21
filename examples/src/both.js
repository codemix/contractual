function divide (a, b) {
  pre:
    typeof a === 'number';
    typeof b === 'number';
    b !== 0;
  main:
    return a / b;
  post:
    __result < a;
}