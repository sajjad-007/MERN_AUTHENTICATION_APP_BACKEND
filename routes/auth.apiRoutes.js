const express = require('express');
const {
  createAccount,
  otpVerify,
  login,
  logOut,
  getUser,
  forgotPassword,
  resetPassword,
} = require('../controller/userController');
const { isAuthenticated } = require('../middleware/auth');
const router = express.Router();

router.post('/register', createAccount);
router.post('/otp-verification', otpVerify);
router.post('/login', login);
router.post('/logout', isAuthenticated, logOut);
router.get('/getUser', isAuthenticated, getUser);
router.post('/password/forgot', forgotPassword);
router.put('/password/reset/:token', resetPassword);

module.exports = router;
