describe('Integration Tests', function () {

  it('simple precondition', function () {
    COMPARE(
      function z (a) {
        pre:
          a > 0;
        main:
          return a++;
      },
      function z (a) {
        OBLIGATIONS.precondition(a > 0);
        return a++;
      }
    );
  });

  it('precondition with if statement', function () {
    COMPARE(
      function z (a) {
        pre:
          if (a > 0) {
            a > 10;
          }
          else {
            a < 100
          }
        main:
          return a++;
      },
      function z (a) {
        if (a > 0) {
          OBLIGATIONS.precondition(a > 10);
        }
        else {
          OBLIGATIONS.precondition(a < 100);
        }
        return a++;
      }
    );
  });

  it('simple postcondition', function () {
    COMPARE(
      function z (a) {
        main:
          return a++;
        post:
          __result > 10;
      },
      function z (a) {
        var __result;
        __result = a++;
        OBLIGATIONS.postcondition(__result > 10);
        return __result;
      }
    );
  });

  it('postcondition with if statement', function () {
    COMPARE(
      function z (a) {
        main:
          return a++;
        post:
          if (a > 10) {
            __result > 10;
          }
      },
      function z (a) {
        var __result;
        __result = a++;
        if (a > 10) {
          OBLIGATIONS.postcondition(__result > 10);
        }
        return __result;
      }
    );
  });

  it('postcondition with early return', function () {
    COMPARE(
      function z (a) {
        main:
          if (a > 100) {
            return;
          }
          return a++;
        post:
          __result > 10;
      },
      function z (a) {
        var __result;
        main: {
          if (a > 100) {
            __result = undefined;
            break main;
          }
          __result = a++;
          break main;
        }
        OBLIGATIONS.postcondition(__result > 10);
        return __result;
      }
    );
  });

  it('simple invariant', function () {
    COMPARE(
      function z (a) {
        invariant:
          a > 0;
        main:
          return a++;
      },
      function z (a) {
        OBLIGATIONS.invariant(a > 0);
        var __result;
        __result = a++;
        OBLIGATIONS.invariant(a > 0);
        return __result;
      }
    );
  });

  it('simple invariant, no return', function () {
    COMPARE(
      function z (a) {
        invariant:
          a > 0;
        main:
          a++;
      },
      function z (a) {
        OBLIGATIONS.invariant(a > 0);
        var __result;
        a++;
        OBLIGATIONS.invariant(a > 0);
        return __result;
      }
    );
  });

  it('invariant with if statement', function () {
    COMPARE(
      function z (a) {
        invariant:
          if (a > 10) {
            a < 100;
          }
        main:
          return a++;
      },
      function z (a) {
        if (a > 10) {
          OBLIGATIONS.invariant(a < 100);
        }
        var __result;
        __result = a++;
        if (a > 10) {
          OBLIGATIONS.invariant(a < 100);
        }
        return __result;
      }
    );
  });

  it('invariant with early return', function () {
    COMPARE(
      function z (a) {
        invariant:
          a > 0;
        main:
          if (a > 100) {
            return;
          }
          return a++;
      },
      function z (a) {
        OBLIGATIONS.invariant(a > 0);
        var __result;
        main: {
          if (a > 100) {
            __result = undefined;
            break main;
          }
          __result = a++;
          break main;
        }
        OBLIGATIONS.invariant(a > 0);
        return __result;
      }
    );
  });


});