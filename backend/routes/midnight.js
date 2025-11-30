const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/midnightcontroller');

router.post('/prove', ctrl.prove);
router.post('/verify', ctrl.verify);

module.exports = router;
