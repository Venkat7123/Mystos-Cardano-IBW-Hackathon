const express = require('express');
const router = express.Router();
const ratingCtrl = require('../controllers/ratingcontroller');

router.post('/submit', ratingCtrl.submit);

module.exports = router;
