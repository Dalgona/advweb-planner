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

const router = express.Router();

/*
 * GET /user
 * Gets information about the current user identified by a token.
 */
router.get('/', ejwt({ secret: config.jwtSecret }), (req, res, next) => {
  const userId = req.user.userId;
  const email = req.user.email;
  let valid = !!(userId && email);

  if (valid) {
    apiUser
    .check(userId, email)
    .then(u => {
      res.status(200).type('application/json').send(apiUser.toJSON(u));
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    })
  } else {
    res
    .status(401)
    .type('application/json')
    .send(error.toJSON(error.code.E_NOAUTH));
  }
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
  // Check if the user supplied all required information.
  const email = (req.body['email'] || '').trim();
  const auth = (req.body['auth'] || '').trim();
  let valid = !!(email && auth);

  if (valid) {
    apiUser
    .authenticate(email, auth)
    .then(token => {
      res.status(200).type('application/json').send({ token: token });
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
})

module.exports = router;
