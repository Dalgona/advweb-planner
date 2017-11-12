/*
 * routes/api/todo-item
 * This module exposes API endpoints related to manipulating to-do items.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiTodoItem = require('../../api/todo-item');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /todo-item/:id
 * Gets information of specified to-do list item.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  apiTodoItem
  .get(req.user, req.params.id)
  .then(item => {
    res.status(200).type('application/json').send(apiTodoItem.toJSON(item));
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * PUT /todo-item/:id
 * Modifies information of specified to-do list item.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const title = (req.body.title || '').trim();
  const complete = req.body.complete ? req.body.complete === 'true' : null;
  apiTodoItem
  .update(req.user, req.params.id, { title: title, complete: complete })
  .then(item => {
    res.status(205).type('application/json').send(apiTodoItem.toJSON(item));
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * DELETE /todo-item/:id
 * Permanently deletes specified to-do list item.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiTodoItem
  .delete(req.user, req.params.id)
  .then(() => {
    res.status(205).type('application/json').send({
      message: 'to-do list item deleted'
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

module.exports = router;
