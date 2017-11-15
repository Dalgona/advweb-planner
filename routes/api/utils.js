/*
 * This module contains codes that are frequently used by router modules.
 */

const error = require('../../api/error');

module.exports = {
  sendJSON: (res, status, data) =>
    res.status(status).type('application/json').send(data),

  sendError: res => (arg1, arg2) => {
    if (!arg2) {
      res
      .status(arg1.status)
      .type('application/json')
      .send(error.toJSON(arg1.code));
    } else {
      res.status(arg1).type('application/json').send(error.toJSON(arg2));
    }
  }
};
