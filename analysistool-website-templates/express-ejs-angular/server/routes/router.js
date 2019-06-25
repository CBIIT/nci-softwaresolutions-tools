const express = require('express')
const router = express.Router();

// serve static files under the root /public directory
router.use(express.static('public'));

// register route middlware
router.use(require('./middleware'));

// register routes for apis
router.use('/api', require('./api'));

// register routes for rendering pages
router.use(require('./pages'));

module.exports = router;