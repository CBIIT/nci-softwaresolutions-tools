const express = require('express');
const compression = require('compression');
const config = require('../../config.json');
const logger = require('../logger');
const router = express.Router();

router.use(compression());
router.use(require('./middleware'));
router.use('/api', require('./api'));
router.use(express.static('public'));
router.use('*', (req, res) =>
    res.sendFile('index.html', {root: 'public'})
);

// log errors
router.use((error, req, res, next) => {
    const { code, message, stack } = error;
    logger.error(stack);
    res.status(500).json(config.production
        ? { message: 'Internal Error' }
        : { code, message, stack });
});

module.exports = router;
