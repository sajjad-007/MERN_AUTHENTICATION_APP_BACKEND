const express = require('express');
const router = express.Router();
const { createAccount } = require('../controller/userController');

router.post('/create/account', createAccount);

module.exports = router;
