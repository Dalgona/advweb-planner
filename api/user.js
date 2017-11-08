var env = process.env.NODE_ENV || 'development';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = require('../config/config.json')[env]
const error = require('../api/error');
const User = require('../models').User;

/*
 * Inserts a new User instance into the database.
 */
exports.create = (fullName, email, auth) => new Promise((resolve, reject) => {
  User
  .findAll({ where: { email: email } })
  .then(result => {
    if (result.length != 0) {
      // A user with the given email address already exists.
      reject({ status: 403, code: error.code.E_EMAILDUP });
    } else {
      // Good to go. Create a new user account.
      const now = new Date();
      const user = User.build({
        createdAt: now,
        modifiedAt: now,
        fullName: fullName,
        email: email,
        auth: crypto.createHash('sha256').update(auth).digest('base64'),
        verified: false
      });
      user
      .save()
      .then(newUser => resolve(newUser))
      .catch(e => {
        console.error(e);
        reject({ status: 500, code: error.code.E_DBERROR });
      });
    }
  })
  .catch(e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  });
});

/*
 * Checks if the provided token contains valid user information.
 */
exports.check = (userId, email) => new Promise((resolve, reject) => {
  User
  .findOne({ where: { id: userId, email: email } })
  .then(result => {
    if (result) {
      resolve(result);
    } else {
      reject({ status: 401, code: error.code.E_NOAUTH });
    }
  })
  .catch(e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  });
});

/*
 * Tries to authenticate user.
 */
exports.authenticate = (email, auth) => new Promise((resolve, reject) => {
  const hashedAuth = crypto.createHash('sha256').update(auth).digest('base64');
  User
  .findAll({ where: { email: email, auth: hashedAuth } })
  .then(result => {
    if (result.length == 0) {
      // Could not find a user with the given credential.
      reject({ status: 403, code: error.code.E_LOGINFAIL });
    } else {
      // Matching user found. Generate a JWT.
      const user = result[0];
      const objectToSign = {
        userId: user.id,
        email: user.email
      };
      const jwtOptions = { expiresIn: '30d' };
      const token = jwt.sign(objectToSign, config.jwtSecret, jwtOptions);
      resolve(token);
    }
  })
  .catch(e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  })
});

/*
 * Given an instance of User, generates a JSON which can be sent
 * back to clients.
 */
exports.toJSON = instance => JSON.stringify({
  id: instance.id,
  createdAt: instance.createdAt,
  modifiedAt: instance.modifiedAt,
  email: instance.email,
  fullName: instance.fullName,
  verified: instance.verified
});
