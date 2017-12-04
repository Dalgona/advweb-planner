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
const { sendJSON, sendError } = require('./utils');

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
    .then(o => sendJSON(res, 200, o))
    .catch(sendError(res));
  })
  .catch(sendError(res));
});

/*
 * PUT /schedule/:id
 * Updates information of specified schedule.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const args = apiSchedule.processArgs(req.body);
  const stripPlanner = req.query.stripPlanner === 'true';
  const stripUser = req.query.stripUser === 'true';
  const valid = args.title && (args.allday || (!args.allday && args.endsAt));
  if (valid) {
    apiSchedule
    .update(req.user, req.params.id, args)
    .then(s => {
      apiSchedule
      .toJSON(s, { stripPlanner: stripPlanner, stripUser: stripUser })
      .then(o => sendJSON(res, 200, o))
      .catch(sendError(res));
    })
    .catch(sendError(res));
  } else {
    sendError(res)(400, error.code.E_BADARG);
  }
});

/*
 * DELETE /schedule/:id
 * Permanently deletes specified schedule.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiSchedule
  .delete(req.user, req.params.id)
  .then(() => sendJSON(res, 200, { message: 'schedule deleted' }))
  .catch(sendError(res));
});

module.exports = router;
