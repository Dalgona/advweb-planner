/*
 * api/error
 * This module defines error codes and messages.
 * This module also provides function for generating error objects.
 */

/*
 * --- ERROR CODE SYSTEM ---
 *  1xx: Users
 *  2xx: Planners
 *  3xx: Schedules
 *  4xx: To-do lists and items
 *  5xx: Labels
 *  8xx: Problems in API calls
 *  9xx: System Error (server, database, etc.)
 */

const codes = {
  E_NOAUTH: 100,
  E_NOACCESS: 101,
  E_EMAILDUP: 102,
  E_LOGINFAIL: 103,
  E_ACCDELREFUSED: 104,
  E_NOPLANNER: 200,
  E_ARGMISSING: 800,
  E_DBERROR: 900,
};

const messages = {};
messages[codes.E_NOAUTH] = 'cannot authenticate you';
messages[codes.E_NOACCESS] = 'you are not allowed to access this object';
messages[codes.E_EMAILDUP] = 'email address is duplicate';
messages[codes.E_LOGINFAIL] = 'incorrect email address or password';
messages[codes.E_ACCDELREFUSED] = 'you need more courage to delete an account';
messages[codes.E_NOPLANNER] = 'the planner you are looking for does not exist';
messages[codes.E_ARGMISSING] = 'required arguments are missing';
messages[codes.E_DBERROR] = 'database error';

exports.code = codes;
exports.messages = messages;
exports.toJSON = code => JSON.stringify({
  error: {
    code: code,
    message: messages[code] || 'unknown error'
  }
});
