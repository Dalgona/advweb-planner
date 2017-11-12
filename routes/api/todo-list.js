/*
 * routes/api/todo-list
 * This module exposes API endpoints related to manipulating to-do lists.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiTodoList = require('../../api/todo-list');
const apiTodoItem = require('../../api/todo-item');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /todo-list/:id
 * Gets information of spceified to-do list.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  apiTodoList
  .get(req.user, req.params.id)
  .then(l => {
    apiTodoList
    .toJSON(l, { stripPlanner: stripPlanner, stripUser: stripUser })
    .then(o => res.status(200).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('applicaiton/json').send(error.toJSON(e.code));
  });
});

/*
 * PUT /todo-list/:id
 * Modifies information of specified to-do list.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const title = (req.body.title || '').trim();
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  apiTodoList
  .update(req.user, req.params.id, title)
  .then(l => {
    apiTodoList
    .toJSON(l, { stripPlanner: stripPlanner, stripUser: stripUser })
    .then(o => res.status(205).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * DELETE /todo-list/:id
 * Permanently deletes specified to-do list and its items.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiTodoList
  .delete(req.user, req.params.id)
  .then(() => {
    res.status(205).type('application/json').send({
      message: 'to-do list deleted'
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*****************************/
/* TO-DO LIST ITEM RESOURCES */
/*****************************/

/*
 * POST /todo-list/:id/item
 * Appends a new item to the specified to-do list.
 */
router.post('/:id(\\d+)/item', (req, res, next) => {
  const title = (req.body.title || '').trim();
  if (title) {
    apiTodoItem
    .create(req.user, req.params.id, title)
    .then(item => {
      res.status(201).type('application/json').send(apiTodoItem.toJSON(item));
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  } else {
    res
    .status(400)
    .type('application/json')
    .send(error.toJSON(error.code.E_ARGMISSING));
  }
});

module.exports = router;
