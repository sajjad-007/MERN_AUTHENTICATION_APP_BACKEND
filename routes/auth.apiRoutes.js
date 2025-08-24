const express = require('express');
const { createAccount } = require('../controller/userController');
const router = express.Router();

router.post('/create/account', createAccount );

module.exports = router;
