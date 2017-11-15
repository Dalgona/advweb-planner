/*
 * routes/api
 * This module defines the entry point of web API service.
 */

const express = require('express');
const bodyParser = require('body-parser');

const error = require('../../api/error');
const { sendJSON, sendError } = require('./utils');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use('/user', require('./user'));
router.use('/planner', require('./planner'));
router.use('/todo-list', require('./todo-list'));
router.use('/todo-item', require('./todo-item'));
router.use('/label', require('./label'));
router.use('/schedule', require('./schedule'));

router.use((req, res, next) => sendError(res)(404, error.code.E_NOENT))

// Custom error handler
router.use((err, req, res, next) => {
  switch (err.name) {
  case 'UnauthorizedError':
    sendError(res)(401, error.code.E_NOAUTH);
    break;
  default:
    next(err);
    break;
  }
});

module.exports = router;
