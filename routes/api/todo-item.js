/*
 * routes/api/todo-item
 * This module exposes API endpoints related to manipulating to-do items.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiTodoList = require('../../api/todo-list');
const { sendJSON, sendError } = require('./utils');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /todo-item/:id
 * Gets information of specified to-do list item.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  apiTodoList
  .getItem(req.user, req.params.id)
  .then(item => sendJSON(res, 200, apiTodoList.itemToJSON(item)))
  .catch(sendError(res));
});

/*
 * PUT /todo-item/:id
 * Modifies information of specified to-do list item.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const title = (req.body.title || '').trim();
  const complete = req.body.complete ? req.body.complete === 'true' : null;
  apiTodoList
  .updateItem(req.user, req.params.id, { title: title, complete: complete })
  .then(item => sendJSON(res, 200, apiTodoList.itemToJSON(item)))
  .catch(sendError(res));
});

/*
 * DELETE /todo-item/:id
 * Permanently deletes specified to-do list item.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiTodoList
  .deleteItem(req.user, req.params.id)
  .then(() => sendJSON(res, 200, { message: 'to-do list item deleted' }))
  .catch(sendError(res));
});

module.exports = router;
