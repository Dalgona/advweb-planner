/*
 * This module contains functions which wrap frequently used codes.
 */

const error = require('./error');

module.exports = {
  failWithDBError: reject => e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  }
};
