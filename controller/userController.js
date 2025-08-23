const { User } = require('../model/userSchema');
const { asyncErrorCatcher } = require('../error/asyncError');
const { ErrorHandler } = require('../error/error');

const createAccount = asyncErrorCatcher(async (req, res, next) => {
  const { fullName, email, phoneNumber, password, accoutnVerified } = req.body;
  if (!fullName || !email || !phoneNumber || !password || !accoutnVerified) {
    return next(new ErrorHandler('Credentials Missing!', 404));
  }
  //find user exist or not
  const existingUser = await User.findOne({
    $or: [
      { email: email, accoutnVerified: true },
      { phoneNumber: phoneNumber, accoutnVerified: true },
    ],
  });
  if (existingUser) {
    return next(new ErrorHandler('Email or Phone Number exist!', 401));
  }

  //
  const userAttemptToRegister = await User.find({
    $or: [
      { email: email, accoutnVerified: false },
      { phoneNumber: phoneNumber, accoutnVerified: false },
    ],
  });
  if (userAttemptToRegister.length > 3) {
    return next(
      new ErrorHandler(
        'You have excceded your registration attempt! try with another email or phone number '
      )
    );
  }
  // User data save into database
  const userData = await User.create({
    fullName,
    email,
    phoneNumber,
    password,
    accoutnVerified,
  });
  if (!userData) {
    return next(new ErrorHandler("User Data Couldn't Save!", 400));
  }
  
  const verificode = await ge
  res.status(200).json({
    success: true,
    message: 'successfull',
  });
});

module.exports = { createAccount };
