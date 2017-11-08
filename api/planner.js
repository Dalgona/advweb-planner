var env = process.env.NODE_ENV || 'development';

const error = require('../api/error');
const Planner = require('../models').Planner;
const apiUser = require('./user');

const create = (token, title) => new Promise((resolve, reject) => {
  apiUser
  .check(token)
  .then(u => {
    const now = new Date();
    u.createPlanner({
      createdAt: now,
      modifiedAt: now,
      title: title
    })
    .then(newPlanner => resolve(newPlanner))
    .catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR});
    })
  })
  .catch(e => reject(e));
});

const toJSON = (instance, stripUser) => new Promise((resolve, reject) => {
  const ret = {
    id: instance.id,
    createdAt: instance.createdAt,
    modifiedAt: instance.modifiedAt,
    owner: null,
    title: instance.title
  };
  if (stripUser) {
    resolve(ret);
  } else {
    instance
    .getUser()
    .then(u => {
      ret.owner = apiUser.toJSON(u);
      resolve(ret);
    })
    .catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  }
});

module.exports = {
  create: create,
  toJSON: toJSON
};
