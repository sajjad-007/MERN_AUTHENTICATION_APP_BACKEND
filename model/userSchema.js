const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
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
  verificationCode: Number,
  verificationCodeExpire: Date,
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (userEnteredPassword) {
  return await bcrypt.compare(userEnteredPassword, this.password);
};

const User = mongoose.model('user', userSchema);

module.exports = { User };
