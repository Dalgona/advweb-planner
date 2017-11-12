const error = require('../api/error');
const TodoItem = require('../models').TodoItem;
const apiTodoList = require('./todo-list');

/*
 * Creates a new to-do list item
 */
const create = (token, listId, title) => new Promise((resolve, reject) => {
  apiTodoList
  .get(token, listId)
  .then(list => {
    const now = new Date();
    list.createTodoItem({
      createdAt: now,
      modifiedAt: now,
      title: title,
      complete: false
    })
    .then(resolve)
    .catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

/*
 * Gets information of specified to-do list item.
 */
const get = (token, itemId) => new Promise((resolve, reject) => {
  TodoItem
  .findOne({ where: { id: itemId } })
  .then(item => {
    if (item) {
      item
      .getTodoList()
      .then(list => {
        apiTodoList
        .getOwner(list)
        .then(uid => {
          if (uid == token.userId) {
            resolve(item);
          } else {
            reject({ status: 403, code: error.code.E_NOACCESS });
          }
        })
        .catch(reject);
      })
      .catch(e => {
        console.error(e);
        reject({ status: 500, code: error.code.E_DBERROR });
      });
    } else {
      reject({ status: 404, code: error.code.E_NOENT });
    }
  })
  .catch(e => {
    console.log(e);
    reject({ status: 500, code: error.code.E_DBERROR });
  });
});

/*
 * Modifies information of specified to-do list item.
 */
const update = (token, itemId, args) => new Promise((resolve, reject) => {
  get(token, itemId)
  .then(item => {
    let change = false;
    if (args.title) {
      item.title = args.title;
      change = true;
    }
    if (args.complete !== null) {
      item.complete = args.complete;
      change = true;
    }
    if (change) {
      item.modifiedAt = new Date();
    }
    item.save().then(resolve).catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

/*
 * Permanently deletes specified to-do list item.
 */
const delete_ = (token, itemId) => new Promise((resolve, reject) => {
  get(token, itemId)
  .then(item => {
    item.destroy().then(resolve).catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

const toJSON = instance => ({
  id: instance.id,
  createdAt: instance.createdAt,
  modifiedAt: instance.modifiedAt,
  title: instance.title,
  complete: instance.complete
});

module.exports = {
  create: create,
  get: get,
  update: update,
  delete: delete_,
  toJSON: toJSON
};
