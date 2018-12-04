const express = require('express')
const router = express.Router();

// add properties to locals from the current request
router.use((req, res, next) => {
    const locals = req.app.locals;

    // strip leading/trailing slashes
    const normalized = path => path
        .replace(/^\/+/, '')
        .replace(/\/+$/, '');

    // set currently selected route (undefined if 404)
    locals.requestPath = req.path;
    locals.currentRoute = (locals.navbarLinks || []).find(route =>
        normalized(route.path) === normalized(req.path)
    );
    next();
});

module.exports = router;
