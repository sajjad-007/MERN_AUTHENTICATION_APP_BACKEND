const { asyncErrorCatcher } = require('../error/asyncError');
const { ErrorHandler } = require('../error/error');
const { User } = require('../model/userSchema');
const jwt = require('jsonwebtoken');

const isAuthenticated = asyncErrorCatcher(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    return next(new ErrorHandler('User is not Authenticated!', 400));
  }
  const decode = jwt.verify(token, process.env.TOKEN_SECRET_KEY);
  if (!decode) return next(new ErrorHandler("couldn't verify user!", 401));

  req.user = await User.findById(decode.id);

  if (!req.user) return next(new ErrorHandler('user not found!', 404));
  next();
});

module.exports = { isAuthenticated };
