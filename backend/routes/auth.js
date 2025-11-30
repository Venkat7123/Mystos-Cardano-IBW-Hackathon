const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authcontroller');

router.post('/login', authCtrl.login);
router.post('/logout', authCtrl.logout);
router.get('/me', authCtrl.me);

module.exports = router;
