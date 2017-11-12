const error = require('../api/error');
const TodoList = require('../models').TodoList;
const apiPlanner = require('./planner');

//const create

//const get

//const update

//const delete_

const toJSON = instance => ({
  id: instance.id,
  createdAt: instance.createdAt,
  modifiedAt: instance.modifiedAt,
  title: instance.title,
  complete: instance.complete
});

module.exports = {
  //create: create,
  //get: get,
  //update: update,
  //delete: delete_,
  toJSON: toJSON
};
