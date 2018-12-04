const express = require('express');
const compression = require('compression');
const router = express.Router();

router.use(compression());

router.get('/ping', (req, res) => {
    res.send('true');
});

module.exports = router;
