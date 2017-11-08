var env = process.env.NODE_ENV || 'development';

const error = require('../api/error');
const Planner = require('../models').Planner;
const apiUser = require('./user');

/*
 * Creates a new Planner object and give it to the current user.
 */
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

/*
 * Get a list of all planners owned by the current user.
 */
const getAll = (token) => new Promise((resolve, reject) => {
  apiUser
  .check(token)
  .then(u => {
    u
    .getPlanners({ order: [ [ 'createdAt', 'ASC' ] ] })
    .then(result => resolve(result))
    .catch(e => {
      console.error(e);
      reject({ code: 500, code: error.code.E_DBERROR });
    })
  })
  .catch(e => reject(e));
});

/*
 * Get information of single planner specified by id.
 */
const get = (token, plannerId) => new Promise((resolve, reject) => {
  Planner
  .findOne({ where: { id: plannerId } })
  .then(planner => {
    if (planner) {
      if (planner.UserId == token.userId) {
        resolve(planner);
      } else {
        reject({ status: 403, code: error.code.E_NOACCESS });
      }
    } else {
      reject({ status: 404, code: error.code.E_NOPLANNER });
    }
  })
  .catch(e => reject({ status: 500, code: error.code.E_DBERROR }));
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
  getAll: getAll,
  get: get,
  toJSON: toJSON
};
