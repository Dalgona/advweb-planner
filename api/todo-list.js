const error = require('../api/error');
const TodoList = require('../models').TodoList;
const apiPlanner = require('./planner');
const apiTodoItem = require('./todo-item');

const getAll = (token, plannerId) => new Promise((resolve, reject) => {
  apiPlanner
  .get(token, plannerId)
  .then(p => {
    p
    .getTodoLists({ order: [ [ 'createdAt', 'ASC' ] ] })
    .then(resolve)
    .catch(e => {
      console.error(e);
      reject({ status: 500, code: error.code.E_DBERROR });
    });
  })
  .catch(reject);
});

//const create

//const get

//const update

//const delete_

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
  //create: create,
  //get: get,
  //update: update,
  //delete: delete_,
  toJSON: toJSON
};
