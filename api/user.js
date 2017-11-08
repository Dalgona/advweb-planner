var env = process.env.NODE_ENV || 'development';

const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const config = require('../config/config.json')[env]
const error = require('../api/error');
const User = require('../models').User;

const _hashed = text =>
  crypto.createHash('sha256').update(text).digest('base64');

/*
 * Inserts a new User instance into the database.
 */
const create = (fullName, email, auth) => new Promise((resolve, reject) => {
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
        auth: _hashed(auth),
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
const check = (token) => new Promise((resolve, reject) => {
  const userId = token.userId || '';
  const email = token.email || '';
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
 * Tries to update a user's information.
 */
const update = (token, fullName, auth) => new Promise((resolve, reject) => {
  check(token)
  .then(u => {
    const newName = (fullName || '').trim();
    const newAuth = auth || '';
    if (newName) {
      u.fullName = newName;
    }
    if (newAuth) {
      u.auth = _hashed(newAuth);
    }
    if (newName || newAuth) {
      u.modifiedAt = new Date();
    }
    u.save().then(u2 => resolve(u2)).catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(e => reject(e));
});

/*
 * Tries to delete the current user account.
 */
const delete_ = (token, email, auth) => new Promise((resolve, reject) => {
  check(token)
  .then(u => {
    if (u.email === email && u.auth === _hashed(auth)) {
      u
      .destroy({ force: true })
      .then(resolve)
      .catch(e => {
        console.error(e);
        reject({ status: 500, code: error.code.E_DBERROR });
      });
    } else {
      reject({ status: 403, code: error.code.E_ACCDELREFUSED });
    }
  })
  .catch(e => reject(e));
});

/*
 * Tries to authenticate user.
 */
const authenticate = (email, auth) => new Promise((resolve, reject) => {
  User
  .findAll({ where: { email: email, auth: _hashed(auth) } })
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
// TODO: convert to a Promise to maintain code consistency.
const toJSON = instance => ({
  id: instance.id,
  createdAt: instance.createdAt,
  modifiedAt: instance.modifiedAt,
  email: instance.email,
  fullName: instance.fullName,
  verified: instance.verified
});

module.exports = {
  create: create,
  check: check,
  update: update,
  delete: delete_,
  authenticate: authenticate,
  toJSON: toJSON
};
