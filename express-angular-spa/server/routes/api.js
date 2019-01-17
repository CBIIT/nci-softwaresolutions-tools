const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => res.json(true));

module.exports = router;
