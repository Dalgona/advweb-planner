/*
 * routes/api/user
 * This module exposes API endpoints related to manipulating user accounts.
 */

var express = require('express');
var router = express.Router();

const error = require('../../api/error');
const apiUser = require('../../api/user');

/*
 * GET /user
 * Gets information about the current user identified by a token.
 */
router.get('/', (req, res, next) => {
  res.send('get current user information');
});

/*
 * POST /user
 * Creates a new user account.
 */
router.post('/', (req, res, next) => {
  // Check if the user supplied all required information.
  const fullName = (req.body['fullName'] || '').trim();
  const email = (req.body['email'] || '').trim();
  const auth = (req.body['auth'] || '').trim();
  let valid = !!(fullName && email && auth);

  if (valid) {
    apiUser
    .create(fullName, email, auth)
    .then(newUser => {
      res.status(201).type('application/json').send(apiUser.toJSON(newUser));
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  } else {
    res
    .status(400)
    .type('application/json')
    .send(error.toJSON(error.code.E_ARGMISSING));
  }
});

/*
 * PUT /user
 * Updates information of the current user identified by a token.
 */
router.put('/', (req, res, next) => {
  res.send('update user information');
});

/*
 * DELETE /user
 * Permanently deletes the current user account identified by a token.
 */
router.delete('/', (req, res, next) => {
  res.send('delete current user');
});

/*
 * POST /user/authenticate
 * Matchs a user account with provided credential
 * and generates a JSON web token.
 */
router.post('/authenticate', (req, res, next) => {
  res.send('authenticate user');
})

module.exports = router;
