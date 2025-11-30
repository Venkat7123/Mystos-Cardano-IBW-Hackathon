// backend/routes/dao.js
const express = require('express');
const router = express.Router();
const daoCtrl = require('../controllers/daocontroller');

router.get('/proposals', daoCtrl.proposals);
router.get('/proposals/:id', daoCtrl.proposalById);
router.post('/vote', daoCtrl.vote);

module.exports = router;
