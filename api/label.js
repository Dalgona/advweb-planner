const error = require('./error');
const Label = require('../models').Label;
const apiUser = require('./user');

/*
 * Gets a list of all labels created by the current user.
 */
const getAll = (token) => new Promise((resolve, reject) => {
  apiUser
  .check(token)
  .then(u => {
    u
    .getLabels({ order: [ [ 'id', 'ASC' ] ] })
    .then(result => resolve(result))
    .catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

/*
 * Creates a new label.
 */
const create = (token, args) => new Promise((resolve, reject) => {
  apiUser
  .check(token)
  .then(u => {
    const now = new Date();
    const color = /#[0-9A-Fa-f]{6}/.test(args.color) ? args.color : '#808080';
    u.createLabel({
      createdAt: now,
      modifiedAt: now,
      title: args.title,
      color: color
    })
    .then(resolve)
    .catch(e => {
      console.log(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    })
  })
  .catch(reject);
});

/*
 * Gets information of specified label.
 */
const get = (token, id) => new Promise((resolve, reject) => {
  Label
  .findOne({ where: { id: id } })
  .then(label => {
    if (label) {
      if (label.UserId == token.userId) {
        resolve(label);
      } else {
        reject({ status: 403, code: error.code.E_NOACCESS });
      }
    } else {
      reject({ status: 404, code: error.code.E_NOENT });
    }
  })
  .catch(e => {
    console.error(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  });
});

/*
 * Modifies information of selected label.
 */
const update = (token, id, args) => new Promise((resolve, reject) => {
});

/*
 * Permanently deletes selected label.
 */
const delete_ = (token, id) => new Promise((resolve, reject) => {
});

const toJSON = instance => ({
  id: instance.id,
  createdAt: instance.createdAt,
  modifiedAt: instance.modifiedAt,
  title: instance.title,
  color: instance.color
});

module.exports = {
  getAll: getAll,
  create: create,
  get: get,
  update: update,
  delete: delete_,
  toJSON: toJSON
};
