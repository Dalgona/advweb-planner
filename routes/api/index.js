/*
 * routes/api
 * This module defines the entry point of web API service.
 */

var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var router = express.Router();

router.use(bodyParser.urlencoded({ extended: true }));

router.use('/user', require('./user'));
// router.use('/planner', require('./planner'));

router.get('/', (req, res, next) => {
  res.send('welcome to api');
});

module.exports = router;
