const path = require('path');
const express = require('express');
const router = express.Router();

// register routes for apis
router.use('/api', require('./api'));

// serve static files under the root /public directory
router.use(express.static('public'));
router.use('*', (req, res) =>
    res.sendFile(path.join('public', 'index.html'))
);

module.exports = router;