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
//const get

/*
 * Modifies information of specified to-do list item.
 */
//const update

/*
 * Permanently deletes specified to-do list item.
 */
//const delete_

const toJSON = instance => ({
  id: instance.id,
  createdAt: instance.createdAt,
  modifiedAt: instance.modifiedAt,
  title: instance.title,
  complete: instance.complete
});

module.exports = {
  create: create,
  //get: get,
  //update: update,
  //delete: delete_,
  toJSON: toJSON
};
