
const express = require('express');
const router = express.Router();
const walletCtrl = require('../controllers/walletcontroller');

router.post('/register', walletCtrl.register);

module.exports = router;
