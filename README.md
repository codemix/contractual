# Contractual

[![Build Status](https://travis-ci.org/codemix/contractual.svg?branch=master)](https://travis-ci.org/codemix/contractual)

Unobtrusive, backwards compatible syntactic sugar for [Design by contract](http://en.wikipedia.org/wiki/Design_by_contract) in JavaScript.

Design by contract is a very powerful technique for writing robust software, it can be thought of as a formal but convenient method for specifying assertions. Instead of the developer documenting their assumptions in comments, or worse, not documenting them at all, DbyC gives them a way to express their assumptions in a convenient syntax, and have those assumptions validated at runtime.

In Contractual, contracts come in three flavours:

- **[preconditions](http://en.wikipedia.org/wiki/Precondition)** which run at the start of a function.
- **[postconditions](http://en.wikipedia.org/wiki/Postcondition)** which run at the end of a function.
- **[invariants](http://en.wikipedia.org/wiki/Invariant_\(computer_science\))** which run at both the start and end of the function.

Each statement in a contract must evaluate to true for the contract to be valid. If a contract fails, an error will be thrown.

Preconditions are usually used to validate the arguments to a function, or the state of the system before the main function body executes.

Postconditions are used to validate the result of the function.

Invariants are used to ensure that an assumption holds true for the duration of the function.

Neither invariants, preconditions or postconditions themselves may have side-effects, e.g. it is not possible to assign a new value to a variable from within a contract.

> Purity within contracts is enforced as much as possible by the contractual compiler, but it is still possible for a programmer to circumvent, by calling an impure function from within the precondition or postcondition. **This is strongly discouraged.**

Contractual implements DbyC by abusing JavaScript labels. Labels are a very rarely used feature of JavaScript, and a nice thing about them is that if a label is specified but not used, it is simply ignored by the JavaScript engine.
This allows us to break up our function body into labeled sections, without affecting the result or behavior of the function. Contractual then retrieves these special labeled sections and transpiles them into contracts.

Importantly, since the original source code is both valid JavaScript and semantically identical to the result, it is possible to use source code written for Contractual directly, without compiling it. However, it will of course lack the contractual guarantees.


## Examples

1. **Precondition Only.**

  The contract for the following function specifies that the first argument must always be a string.

  ```js
  function warn (message) {
    pre:
      typeof message === 'string';
    main:
      alert('Warning!\n' + message);
  }
  ```

  If we call this function with a non string argument, a `PreconditionError` will be thrown.

  [See the compiled output.](./examples/compiled/precondition.js)


2. **Postcondition Only.**

  The following function specifies that the result of the function must always be an array containing more than one element.

  ```js
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
  ```

  If we call this function without arguments, the post-condition will fail and a `PostconditionError` will be thrown.

  [See the compiled output.](./examples/compiled/postcondition.js)

3. **Preconditions and Postconditions.**

  In this example the precondition specifies that both arguments are numbers and that the second argument is not zero.
  The postcondition specifies that the result of the function is *always* less than the first argument to the function.

  ```js
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
  ```

  [See the compiled output.](./examples/compiled/both.js)

4. **Invariants**

  Invariants run at the beginning and end of a function.

  ```js
  function spend (amount) {
    invariant:
      typeof amount === 'number', "First argument must be a number";
      this.balance >= 0, 'Cannot go overdrawn';
    main:
      this.balance = this.balance - amount;
      return this.balance;
  }
  ```

  [See the compiled output.](./examples/compiled/invariant.js)

4. **Error Messages**

  Often it's nice to provide an error message for the contract that failed, for example:

  ```js
  function divide (a, b) {
    pre:
      typeof a === 'number', "First argument must be a number";
      typeof b === 'number', "Second argument must be a number";
      b !== 0, "May not divide by zero";
    main:
      return a / b;
    post:
      __result =< a, "Result must always be less than or equal to the first argument";
  }
  ```

  Now if a contract fails, the error object will have a descriptive message.

  [See the compiled output.](./examples/compiled/error-messages.js)

## Installation

Install via [npm](http://npmjs.org/).

```
npm install -g contractual
```

Contributors please see [CONTRIBUTING.md](./CONTRIBUTING.md).

## Usage

While Contractual can be used programatically, it is mainly used via a command line interface:

```
> contractual --help
```

```
contractual - Syntactic sugar for Design by contract in JavaScript.

Usage: contractual [OPTIONS] [FILES]

Options:
  --output, -o   The directory to write compiled files to.                                             [default: "./out"]
  --libname, -l  The name of the identifier for the obligations library                                [default: "OBLIGATIONS"]
  --global, -g   Whether a global identifier should be used for the obligations lib.                   [default: false]
  --require, -r  The obligations library to require, if `global` is not specified.                     [default: "obligations"]
  --source-map   If true generate source maps, if a string use it as the source filename for the map.
  --source-root  If set, acts as the root for the source files listed in the source map.
  --version, -v  Show the version information.
  --help, -h     Show this help screen.
```



## License

MIT, see [LICENSE.md](./LICENSE.md).