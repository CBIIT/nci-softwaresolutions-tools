const express = require('express');
const layouts = require('express-ejs-layouts');
const router = express.Router();

router.use(layouts);
router.get('/', (req, res) => res.render('pages/index'));
router.get('/angular', (req, res) => res.render('pages/angular'));
router.get('/help', (req, res) => res.render('pages/help'));
router.get('*', (req, res) => res.render('pages/500'));

module.exports = router;
