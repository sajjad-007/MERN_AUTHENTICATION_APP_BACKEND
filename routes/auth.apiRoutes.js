const express = require('express');
const {
  createAccount,
  otpVerify,
  login,
  logOut,
  getUser,
} = require('../controller/userController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.post('/register', createAccount);
router.post('/otp-verification', otpVerify);
router.post('/login', login);
router.post('/logout',isAuthenticated, logOut);
router.get('/getUser', isAuthenticated, getUser);

module.exports = router;
