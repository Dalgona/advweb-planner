/*
 * routes/api
 * This module defines the entry point of web API service.
 */

const express = require('express');
const bodyParser = require('body-parser');

const error = require('../../api/error');

var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use('/user', require('./user'));
// router.use('/planner', require('./planner'));

router.get('/', (req, res, next) => {
  res.send('welcome to api');
});

// Custom error handler
router.use((err, req, res, next) => {
  switch (err.name) {
  case 'UnauthorizedError':
    res
    .status(401)
    .contentType('application/json')
    .send(error.toJSON(error.code.E_NOAUTH));
    break;
  default:
    next(err);
    break;
  }
});

module.exports = router;
