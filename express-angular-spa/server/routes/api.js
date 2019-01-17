const cors = require('cors');
const express = require('express');
const router = express.Router();

router.use(cors());
router.get('/ping', (req, res) => res.json(true));

module.exports = router;
