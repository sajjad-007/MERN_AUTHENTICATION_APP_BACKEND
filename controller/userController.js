const { User } = require('../model/userSchema');
const { asyncErrorCatcher } = require('../error/asyncError');
const { ErrorHandler } = require('../error/error');
const { emailTemplate } = require('../utils/emailTemplate');
const { sendEmail } = require('../utils/nodemailer');

// verification methods email or password
const sendVerificationCode = async (
  verificationMethod,
  verificationCode,
  email,
  phoneNumber
) => {
  if (verificationMethod === 'email') {
    const templete = emailTemplate(verificationCode);
    await sendEmail({ email, subject: 'Verify Your Email', templete });
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
      const phoneRegx = /^\+880\d{10}$/; // expects +880 followed by 11 digits
      return phoneRegx.test(phoneNumber); // returns true or false
    };
    if (!validatePhoneNumber(phoneNumber)) {
      return next(new ErrorHandler("phone number format doesn't match!", 401));
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
    await sendVerificationCode(
      verificationMethod,
      verificationCode,
      email,
      phoneNumber
    );

    res.status(200).json({
      success: true,
      message: `otp sent at ${email}`,
      userData,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = { createAccount };
