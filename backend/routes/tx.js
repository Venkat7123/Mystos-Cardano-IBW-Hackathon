const express = require('express');
const router = express.Router();
const txCtrl = require('../controllers/txcontroller');

router.get('/coins', txCtrl.coins);

router.post('/receive', txCtrl.receive);

router.post('/send', txCtrl.send);

router.post('/swap', txCtrl.swap);

router.get('/history', txCtrl.history);

module.exports = router;
