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

const router = express.Router();

router.use(ejwt({ secret: config.jwtSecret }));

/*
 * GET /label
 * Gets a list of labels the current user owns.
 */
router.get('/', (req, res, next) => {
  apiLabel
  .getAll(req.user)
  .then(labels => {
    res.status(200).type('application/json').send(labels.map(apiLabel.toJSON));
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
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
    .then(l => {
      res.status(201).type('application/json').send(apiLabel.toJSON(l));
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

/*
 * GET /label/:id
 * Gets information about selected label.
 */
router.get('/:id(\\d+)', (req, res, next) => {
  apiLabel
  .get(req.user, req.params.id)
  .then(l => {
    res.status(200).type('application/json').send(apiLabel.toJSON(l));
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
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
  .then(l => {
    res.status(205).type('application/json').send(apiLabel.toJSON(l));
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  });
});

/*
 * DELETE /label/:id
 * Permanently deletes selected label.
 * The label will be removed from all schedules.
 */
router.delete('/:id(\\d+)', (req, res, next) => {
  apiLabel
  .delete(req.user, req.params.id)
  .then(() => {
    res.status(205).type('application/json').send({
      message: 'label deleted'
    });
  })
  .catch(e => {
    res.status(e.status).type('application/json').send(error.toJSON(e.code));
  })
});

module.exports = router;
