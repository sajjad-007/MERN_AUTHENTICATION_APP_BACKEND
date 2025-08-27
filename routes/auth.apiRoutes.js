const express = require('express');
const { createAccount, otpVerify } = require('../controller/userController');
const router = express.Router();

router.post('/create/account', createAccount );
router.post('/otp-verify', otpVerify);


module.exports = router;
