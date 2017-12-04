/*
 * routes/api/user
 * This module exposes API endpoints related to manipulating user accounts.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiUser = require('../../api/user');
const { sendJSON, sendError } = require('./utils');

const router = express.Router();

/*
 * GET /user
 * Gets information about the current user identified by a token.
 */
router.get('/', ejwt({ secret: config.jwtSecret }), (req, res, next) => {
  apiUser
  .check(req.user)
  .then(u => sendJSON(res, 200, apiUser.toJSON(u)))
  .catch(sendError(res));
});

/*
 * POST /user
 * Creates a new user account.
 */
router.post('/', (req, res, next) => {
  // Check if the user supplied all required information.
  const fullName = (req.body['fullName'] || '').trim();
  const email = (req.body['email'] || '').trim();
  const auth = req.body['auth'] || '';
  let valid = !!(fullName && email && auth);

  if (valid) {
    apiUser
    .create(fullName, email, auth)
    .then(newUser => sendJSON(res, 201, apiUser.toJSON(newUser)))
    .catch(sendError(res));
  } else {
    sendError(res)(400, error.code.E_ARGMISSING);
  }
});

/*
 * PUT /user
 * Updates information of the current user identified by a token.
 */
router.put('/', ejwt({ secret: config.jwtSecret }), (req, res, next) => {
  apiUser
  .update(req.user, req.body.fullName, req.body.auth)
  .then(u => sendJSON(res, 200, apiUser.toJSON(u)))
  .catch(sendError(res));
});

/*
 * DELETE /user
 * Permanently deletes the current user account identified by a token.
 */
router.delete('/', ejwt({ secret: config.jwtSecret }), (req, res, next) => {
  // Check if the user supplied all required information.
  const email = (req.body['email'] || '').trim();
  const auth = req.body['auth'] || '';
  let valid = !!(email && auth);

  if (valid) {
    apiUser
    .delete(req.user, email, auth)
    .then(() => sendJSON(res, 200, { message: 'account deleted' }))
    .catch(sendError(res));
  } else {
    sendError(res)(400, error.code.E_ARGMISSING);
  }
});

/*
 * POST /user/authenticate
 * Matchs a user account with provided credential
 * and generates a JSON web token.
 */
router.post('/authenticate', (req, res, next) => {
  // Check if the user supplied all required information.
  const email = (req.body['email'] || '').trim();
  const auth = req.body['auth'] || '';
  let valid = !!(email && auth);

  if (valid) {
    apiUser
    .authenticate(email, auth)
    .then(token => sendJSON(res, 200, { token: token }))
    .catch(sendError(res));
  } else {
    sendError(res)(400, error.code.E_ARGMISSING);
  }
})

module.exports = router;
