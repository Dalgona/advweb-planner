const error = require('./error');
const Label = require('../models').Label;
const apiUser = require('./user');
const { failWithDBError } = require('./utils');

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
    .catch(failWithDBError(reject));
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
    .catch(failWithDBError(reject));
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
  .catch(failWithDBError(reject));
});

/*
 * Modifies information of selected label.
 */
const update = (token, id, args) => new Promise((resolve, reject) => {
  get(token, id)
  .then(l => {
    let change = false;
    if (args.title) {
      l.title = args.title;
      change = true;
    }
    if (/#[0-9A-Fa-f]{6}/.test(args.color)) {
      l.color = args.color;
      change = true;
    }
    if (change) {
      l.modifiedAt = new Date();
    }
    l.save().then(resolve).catch(failWithDBError(reject));
  })
  .catch(reject);
});

/*
 * Permanently deletes selected label.
 */
const delete_ = (token, id) => new Promise((resolve, reject) => {
  get(token, id)
  .then(l => {
    l.destroy({ force: true }).then(resolve).catch(failWithDBError(reject));
  })
  .catch(reject);
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
