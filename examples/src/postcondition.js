function items (a, b) {
  main:
    var c = [];
    if (a) {
      c.push(a);
    }
    if (b) {
      c.push(b);
    }
    return c;
  post:
    Array.isArray(__result);
    __result.length > 0;
}