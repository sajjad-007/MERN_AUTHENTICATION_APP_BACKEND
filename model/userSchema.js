const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

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
    },
    accoutnVerified: {
      type: Boolean,
      default: false,
    },
    verificationMethod: String,
    verificationCode: Number,
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
  const firstDigits = Math.floor(Math.random() * 10) + 1;
  const lastDigits = Math.floor(Math.random() * 10000).toString().padStart(4,'0');
  return parseInt(firstDigits + lastDigits);
};

const User = mongoose.model('user', userSchema);

module.exports = { User };
