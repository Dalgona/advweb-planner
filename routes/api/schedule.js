/*
 * routes/api/schedule
 * This module exposes API endpoints related to manipulating schedules.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiSchedule = require('../../api/schedule');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /schedule/:id
 * Gets information of specified schedule.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  apiSchedule
  .get(req.user, req.params.id)
  .then(s => {
    apiSchedule
    .toJSON(s, { stripPlanner: stripPlanner, stripUser: stripUser })
    .then(o => res.status(200).type('application/json').send(o))
    .catch(e => {
      res.status(e.status).type('application/json').send(error.toJSON(e.code));
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * PUT /schedule/:id
 * Updates information of specified schedule.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const stripPlanner = req.query.stripPlanner;
  const stripUser = req.query.stripPlanner;
});

/*
 * DELETE /schedule/:id
 * Permanently deletes specified schedule.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiSchedule
  .delete(req.user, req.params.id)
  .then(() => {
    res.status(205).type('application/json').send({
      message: 'schedule deleted'
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

module.exports = router;
