const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    accountVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: String,
    verificationCode: String,
    verificationCodeExpire: Date,
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (userEnteredPassword) {
  return await bcrypt.compare(userEnteredPassword, this.password);
};

userSchema.methods.generateVerificationCode = function () {
  function generateRandomFiveDigitNumber() {
    const firstDigit = Math.floor(Math.random() * 1000) + 1;
    const lastFiveDigit = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(4, 0);
    return firstDigit + lastFiveDigit;
  }
  const verificationCode = generateRandomFiveDigitNumber();
  this.verificationCodeExpire = Date.now() + 5 * 60 * 1000;
  this.verificationCode = verificationCode;

  return verificationCode;
};

userSchema.methods.generateJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.TOKEN_SECRET_KEY, {
    expiresIn: process.env.TOKEN_EXPIRE,
  });
};

// this is not jwt token, its just normal token created by using crypto
userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(20).toString('hex');
  //Hashing and Adding Reset Password Token To UserSchema
  const resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetPasswordToken = resetToken;
  this.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000;
  return token;
};

const User = mongoose.model('user', userSchema);

module.exports = { User };
