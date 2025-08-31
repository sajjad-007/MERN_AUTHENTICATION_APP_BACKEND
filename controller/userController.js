const { User } = require('../model/userSchema');
const { asyncErrorCatcher } = require('../error/asyncError');
const { ErrorHandler } = require('../error/error');
const { emailTemplate } = require('../utils/emailTemplate');
const { sendEmail } = require('../utils/nodemailer');
const twilio = require('twilio');
const { generateTokenForBrowser } = require('../utils/jwtToken');
const crypto = require('crypto');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
// verification methods email or password
const sendVerificationCode = async (
  verificationMethod,
  verificationCode,
  email,
  phoneNumber,
  res,
  next
) => {
  try {
    if (verificationMethod === 'email') {
      const templete = emailTemplate(verificationCode);
      await sendEmail({ email, subject: 'Verify Your Email', templete });
      res.status(200).json({
        success: true,
        message: `OTP sent to ${email}`,
        email,
        phoneNumber,
      });
    } else if (verificationMethod === 'phone') {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split('')
        .join(' ');
      const response = await client.calls.create({
        from: process.env.TWILIO_PHONE,
        to: phoneNumber,
        twiml: `<Response><Say>Your otp is ${verificationCodeWithSpace}. Your otp is ${verificationCodeWithSpace}. Your otp is ${verificationCodeWithSpace}</Say></Response>`,
      });
      if (response) {
        res.status(200).json({
          success: true,
          message: 'we will call you soon for your otp',
        });
      }
    } else {
      return next(new ErrorHandler('Verification failed!', 401));
    }
  } catch (error) {
    return next(new ErrorHandler('Send to Verification code failed!', 500));
  }
};

const createAccount = asyncErrorCatcher(async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, password, verificationMethod } =
      req.body;
    if (
      !fullName ||
      !email ||
      !phoneNumber ||
      !password ||
      !verificationMethod
    ) {
      return next(new ErrorHandler('Credentials Missing!', 404));
    }
    const validatePhoneNumber = phoneNumber => {
      const phoneRegx = /^\+880\d{10}$/; // expects +880 followed by 10 digits
      return phoneRegx.test(phoneNumber); // returns true or false
    };
    if (!validatePhoneNumber(phoneNumber)) {
      return next(new ErrorHandler("phone number format doesn't match!", 401));
    }

    //find user exist or not
    const existingUser = await User.findOne({
      $or: [
        { email: email, accountVerified: true },
        { phoneNumber: phoneNumber, accountVerified: true },
      ],
    });
    if (existingUser) {
      return next(
        new ErrorHandler('Email or Phone Number Already Exist!', 401)
      );
    }

    //
    const userAttemptToRegister = await User.find({
      $or: [
        { email: email, accountVerified: false },
        { phoneNumber: phoneNumber, accountVerified: false },
      ],
    });
    if (userAttemptToRegister?.length > 3) {
      return next(
        new ErrorHandler(
          'You have excceded your registration attempt! try half an hour later',
          401
        )
      );
    }
    // User data save into database
    const userData = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      verificationMethod,
    });
    if (!userData) {
      return next(new ErrorHandler("User Data Couldn't Save!", 400));
    }

    const verificationCode = userData.generateVerificationCode();
    await userData.save();
    await sendVerificationCode(
      verificationMethod,
      verificationCode,
      email,
      phoneNumber,
      res,
      next
    );
    return;
  } catch (error) {
    return next(new ErrorHandler('Error from create Account', 500));
  }
});
const otpVerify = asyncErrorCatcher(async (req, res, next) => {
  const { email, phoneNumber, otp } = req.body;
  // const validatePhoneNumber = phoneNumber => {
  //   const phoneRegx = /^\+880\d{10}$/; // expects +880 followed by 10 digits
  //   return phoneRegx.test(phoneNumber); // returns true or false
  // };
  // if (!validatePhoneNumber(phoneNumber)) {
  //   return next(new ErrorHandler("phone number format doesn't match!", 401));
  // }
  try {
    //Find all unverified users with the same email or phoneNumber.
    //Keep the most recently created one, using sort()
    //Delete the others. using deleteMany()
    const findUnverifiedSameUsers = await User.find({
      $or: [
        { email: email, accountVerified: false },
        { phoneNumber: phoneNumber, accountVerified: false },
      ],
    }).sort({ createdAt: -1 });
    //find() method returns an array[];

    let user;

    if (findUnverifiedSameUsers.length > 1) {
      user = findUnverifiedSameUsers[0];
      await User.deleteMany({
        // $ne = Not Equal
        //Returns all unverified users except the one with (user._id)
        _id: { $ne: user._id },
        $or: [
          { email: email, accountVerified: false },
          { phoneNumber: phoneNumber, accountVerified: false },
        ],
      });
    } else {
      user = findUnverifiedSameUsers[0];
    }
    if (user.verificationCode !== otp) {
      return next(new ErrorHandler("Otp doesn't match", 401));
    }
    // check my otp is expired
    //Current time
    const currentTime = Date.now();
    // convert => user.verificationCodeExpire = 2025-08-27T01:08:09.010+00:00 this to 124343445 this
    const verificationCodeExpire = new Date(
      user.verificationCodeExpire
    ).getTime();

    if (currentTime > verificationCodeExpire) {
      return next(new ErrorHandler('Otp expired', 401));
    }

    user.accountVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpire = null;
    await user.save({ validateModifiedOnly: true });

    generateTokenForBrowser(
      user,
      res,
      200,
      'Verification successfull, Redirecting to homepage'
    );
  } catch (error) {
    return next(new ErrorHandler('Error From Otp Verification', 500));
  }
});
const login = asyncErrorCatcher(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler('Credentials Missing!'));
  }
  //check user exist or not
  const user = await User.findOne({
    email: email,
    accountVerified: true,
  }).select('+password');
  if (!user) {
    return next(new ErrorHandler('User not found!', 404));
  }
  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new ErrorHandler('Invalid Email or Password', 400));
  }
  generateTokenForBrowser(user, res, 200, 'Logged In successfully!');
});
const logOut = asyncErrorCatcher(async (req, res, next) => {
  res
    .status(200)
    .cookie('token', '', {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    })
    .json({
      success: true,
      message: 'Log out successfull!',
    });
});
const getUser = asyncErrorCatcher(async (req, res, next) => {
  // const user = req.user;
  const user = req.user;
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }
  res.status(200).json({
    success: true,
    message: 'User found!',
    user,
  });
});
// FORGOT PASSWORD
const forgotPassword = asyncErrorCatcher(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email, accountVerified: true });
  if (!user) {
    return next(new ErrorHandler('User not found!', 404));
  }
  const token = user.generateResetToken();
  if (!token) {
    return next(new ErrorHandler('Reset Token is Missing!', 400));
  }
  await user.save({ validateModifiedOnly: false });
  const message = `Your reset password token is. \n \n ${process.env.FRONTEND_URL}/reset/password/${token} \n \n If you didn't request for this, you can safely ignore this email`;

  try {
    await sendEmail({ email, subject: 'Reset Password Token', message });
    res.status(200).json({
      success: true,
      message: `Reset token sent at ${email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save();
    return next(
      new ErrorHandler(
        error.message ? error.message : 'Reset password email failed to send',
        400
      )
    );
  }
});
//RESET YOUR PASSWORD
const resetPassword = asyncErrorCatcher(async (req, res, next) => {
  const { token } = req.params;
  const resetToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOneAndUpdate({
    resetPasswordToken: resetToken,
    resetPasswordTokenExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler('Token Invalid or Expired!', 404));
  }

  const { password, confirmPassword } = req.body;

  if ((!password, !confirmPassword)) {
    return next(new ErrorHandler('Credentials Missing!', 400));
  }
  if (password !== confirmPassword) {
    return next(
      new ErrorHandler("Password and Confirm Password Doesn't Match!", 401)
    );
  }
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordTokenExpire = undefined;
  await user.save();
  generateTokenForBrowser(user, res, 200, 'Password reset successfull');
});

module.exports = {
  createAccount,
  otpVerify,
  login,
  logOut,
  getUser,
  forgotPassword,
  resetPassword,
};
