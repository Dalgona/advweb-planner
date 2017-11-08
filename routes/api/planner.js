/*
 * routes/api/planner
 * This module exposes API endpoints related to manipulating planners.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiPlanner = require('../../api/planner');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /planner
 * Gets a list of planners the current user owns.
 */
router.get('/', (req, res, next) => {
  res.send('get a list of planners owned by ' + req.user.email);
});

/*
 * POST /planner
 * Creates a new planner belonging to the current user.
 */
router.post('/', (req, res, next) => {
  const title = (req.body.title || '').trim();
  const stripUser = req.query.stripUser === 'true';
  if (title) {
    apiPlanner
    .create(req.user, title)
    .then(p => {
      apiPlanner
      .toJSON(p, stripUser)
      .then(o => res.status(201).type('application/json').send(o))
      .catch(e => {
        res
        .status(e.status)
        .type('application/json')
        .send(error.toJSON(e.code));
      });
    })
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    })
  } else {
    res
    .status(400)
    .type('application/json')
    .send(error.toJSON(error.code.E_ARGMISSING));
  }
});

/*
 * GET /planner/:id
 * Gets information about selected planner.
 * The `id` parameter must be pointing at a planner owned by the current user.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  res.send('get information of planner #' + req.params.id);
});

/*
 * PUT /planner/:id(\\d+)
 * gets information about selected planner.
 * the `id` parameter must be pointing at a planner owned by the current user.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  res.send('update information of planner #' + req.params.id);
});

/*
 * DELETE e/planner/:id(\\d+)
 * gets information about selected planner.
 * the `id` parameter must be pointing at a planner owned by the current user.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  res.send('delete planner #' + req.params.id);
});

module.exports = router;
