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
        var __result, __completed;
        main: if (!__completed) {
          if (a > 100) {
            __result = undefined;
            __completed = true;
            break main;
          }
          __result = a++;
          __completed = true;
          break main;
        }
        OBLIGATIONS.postcondition(__result > 10);
        return __result;
      }
    );
  });


});