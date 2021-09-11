var express = require('express');
var router = express.Router();

/* GET dashboard page. */
router.use('/',require('./home'));
router.use('/category',require('./category'));
router.use('/post',require('./post'));
router.use('/about',require('./about'));
router.use('/contact',require('./contact'));
router.use('/article',require('./article'));
router.use('/documents',require('./documents'));
router.use('/search', require('./search'));

module.exports = router;
