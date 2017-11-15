/*
 * routes/api/label
 * This module exposes API endpoints related to manipulating labels.
 */

var env = process.env.NODE_ENV || 'development';

const express = require('express');
const ejwt = require('express-jwt');

const config = require('../../config/config.json')[env];
const error = require('../../api/error');
const apiLabel = require('../../api/label');
const { sendJSON, sendError } = require('./utils');

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /label
 * Gets a list of labels the current user owns.
 */
router.get('/', (req, res, next) => {
  apiLabel
  .getAll(req.user)
  .then(labels => sendJSON(res, 200, labels.map(apiLabel.toJSON)))
  .catch(sendError(res));
});

/*
 * POST /label
 * Creates a new label belonging to the current user.
 */
router.post('/', (req, res, next) => {
  const title = (req.body.title || '').trim();
  if (title) {
    apiLabel
    .create(req.user, { title: title, color: req.body.color })
    .then(l => sendJSON(res, 201, apiLabel.toJSON(l)))
    .catch(sendError(res));
  } else {
    sendError(res)(400, error.code.E_ARGMISSING);
  }
});

/*
 * GET /label/:id
 * Gets information about selected label.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  apiLabel
  .get(req.user, req.params.id)
  .then(l => sendJSON(res, 200, apiLabel.toJSON(l)))
  .catch(sendError(res));
});

/*
 * PUT /label/:id
 * Modifies information of selected label.
 */
router.put('/:id(\\d+)', (req, res, next) => {
  const title = (req.body.title || '').trim();
  apiLabel
  .update(req.user, req.params.id, {
    title: title,
    color: req.body.color
  })
  .then(l => sendJSON(res, 205, apiLabel.toJSON(l)))
  .catch(sendError(res));
});

/*
 * DELETE /label/:id
 * Permanently deletes selected label.
 * The label will be removed from all schedules.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiLabel
  .delete(req.user, req.params.id)
  .then(() => sendJSON(res, 205, { message: 'label deleted' }))
  .catch(sendError(res));
});

module.exports = router;
