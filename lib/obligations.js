/**
 * # Precondition Error
 * Thrown when a precondition fails.
 *
 * @param {String}   message The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function PreconditionError(message, caller) {
    this.name = 'PreconditionError';
    this.message = message || 'Precondition failed';
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, caller || PreconditionError);
    }
}
PreconditionError.prototype = Object.create(Error.prototype);
PreconditionError.prototype.constructor = PreconditionError;
/**
 * # Postcondition Error
 * Thrown when a postcondition fails.
 *
 * @param {String} message The error message.
 * @param {Function} caller  The function that threw the error, used for cleaning stack traces.
 */
function PostconditionError(message, caller) {
    this.name = 'PostconditionError';
    this.message = message || 'Postcondition failed';
    if (typeof Error.captureStackTrace === 'function') {
        Error.captureStackTrace(this, caller || PreconditionError);
    }
}
PreconditionError.prototype = Object.create(Error.prototype);
PreconditionError.prototype.constructor = PreconditionError;
/**
 * # Precondition
 * Assets that a precondition is truthy.
 *
 * @param  {Mixed}              subject  The subject to assert.
 * @param  {String}             message  The optional message for the assertion.
 * @throws {PreconditionError}           If the subject is falsey.
 */
function precondition(subject, message) {
    if (!subject) {
        throw new PreconditionError(message, precondition);
    }
}
/**
 * # Postcondition
 * Assets that a postcondition is truthy.
 *
 * @param  {Mixed}               subject  The subject to assert.
 * @param  {String}              message  The optional message for the assertion.
 * @throws {PostconditionError}           If the subject is falsey.
 */
function postcondition(subject, message) {
    if (!subject) {
        throw new PostconditionError(message, postcondition);
    }
}
exports.PreconditionError = PreconditionError;
exports.PostconditionError = PostconditionError;
exports.precondition = precondition;
exports.postcondition = postcondition;