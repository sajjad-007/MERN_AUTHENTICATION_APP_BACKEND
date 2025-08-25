const { User } = require('../model/userSchema');
const { asyncErrorCatcher } = require('../error/asyncError');
const { ErrorHandler } = require('../error/error');
const { emailTemplate } = require('../utils/emailTemplate');
const { sendEmail } = require('../utils/nodemailer');
const twilio = require('twilio');

const client = twilio(
  'AC589df1ece544ede6dbdefeccac884f3f',
  '70757bcce40ab5f415aef6ac02074624'
);
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
        message: `email sent to ${email}`,
      });
    } else if (verificationMethod === 'phone') {
      const verificationCodeWithSpace = verificationCode
        .toString()
        .split('')
        .join(' ');
      const response = await client.calls.create({
        from: +8801824750778,
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
          'You have excceded your registration attempt! try an hour later'
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

module.exports = { createAccount };
