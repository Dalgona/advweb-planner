var express = require('express');
var commonConfig = require('../config/config.json')['common'];
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: commonConfig.appName });
});

module.exports = router;
