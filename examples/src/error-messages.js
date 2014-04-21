function divide (a, b) {
  pre:
    typeof a === 'number', "First argument must be a number";
    typeof b === 'number', "Second argument must be a number";
    b !== 0, "May not divide by zero";
  main:
    return a / b;
  post:
    __result < a, "Result must always be less than the first argument";
}