const error = require('../api/error');
const TodoList = require('../models').TodoList;
const apiPlanner = require('./planner');
const apiTodoItem = require('./todo-item');
const { failWithDBError } = require('./utils');

/*
 * Gets a list of all to-do lists saved in the specified planner.
 */
const getAll = (token, plannerId) => new Promise((resolve, reject) => {
  apiPlanner
  .get(token, plannerId)
  .then(p => {
    p
    .getTodoLists({ order: [ [ 'createdAt', 'ASC' ] ] })
    .then(resolve)
    .catch(failWithDBError(reject));
  })
  .catch(reject);
});

/*
 * Adds a new to-do list to the specified planner.
 */
const create = (token, plannerId, title) => new Promise((resolve, reject) => {
  apiPlanner
  .get(token, plannerId)
  .then(p => {
    const now = new Date();
    p.createTodoList({
      createdAt: now,
      modifiedAt: now,
      title: title
    })
    .then(resolve)
    .catch(failWithDBError(reject));
  })
  .catch(reject);
});

/*
 * Finds id of the user who owns this to-do list.
 */
const getOwner = instance => new Promise((resolve, reject) => {
  instance
  .getPlanner()
  .then(p => resolve(p.UserId))
  .catch(failWithDBError(reject));
});

/*
 * Gets information of selected to-do list.
 */
const get = (token, listId) => new Promise((resolve, reject) => {
  TodoList
  .findOne({ where: { id: listId } })
  .then(list => {
    if (list) {
      getOwner(list)
      .then(uid => {
        if (uid == token.userId) {
          resolve(list);
        } else {
          reject({ status: 403, code: error.code.E_NOACCESS });
        }
      })
      .catch(reject);
    } else {
      reject({ status: 404, code: error.code.E_NOENT });
    }
  })
  .catch(failWithDBError(reject));
});

/*
 * Modifies information of selected to-do list.
 */
const update = (token, listId, title) => Promise((resolve, reject) => {
  get(token, listId)
  .then(list => {
    if (title) {
      list.title = title;
      list.modifiedAt = new Date();
    }
    list.save().then(resolve).catch(failWithDBError(reject));
  })
  .catch(reject);
});

/*
 * Permanently deletes information of selected to-do list.
 */
const delete_ = (token, listId) => new Promise((resolve, reject) => {
  get(token, listId)
  .then(list => {
    list.destroy({ force: true }).then(resolve).catch(failWithDBError(reject));
  })
  .catch(reject);
});

const toJSON = (instance, options) => new Promise((resolve, reject) => {
  const ret = {
    id: instance.id,
    createdAt: instance.createdAt,
    modifiedAt: instance.modifiedAt,
    planner: null,
    title: instance.title,
    complete: null,
    items: null
  };
  instance
  .getTodoItems({ order: [ [ 'createdAt', 'ASC' ] ] })
  .then(items => {
    ret.complete = items.reduce((acc, item) => acc && item.complete, true);
    ret.items = items.map(apiTodoItem.toJSON);
    if (options.stripPlanner) {
      resolve(ret);
    } else {
      instance
      .getPlanner()
      .then(p => {
        apiPlanner
        .toJSON(p, options.stripUser)
        .then(o => {
          ret.planner = o;
          resolve(ret);
        })
        .catch(reject);
      })
      .catch(reject);
    }
  })
  .catch(reject);
});

module.exports = {
  getAll: getAll,
  create: create,
  get: get,
  getOwner: getOwner,
  update: update,
  delete: delete_,
  toJSON: toJSON
};
