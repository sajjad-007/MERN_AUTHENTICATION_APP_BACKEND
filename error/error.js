// Error = Node js built in Error, where we can see all error message
class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message); // calls Error's constructor with message or call the parent class’s constructor, and pass message to it.
    this.statusCode = statusCode;
  }
}

const errorMiddleware = (err, req, res, next) => {
  err.message = message || 'Internal Server Error!';
  err.statusCode = statusCode || 500;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path}`;
    err = new ErrorHandler(message, 401);
  }
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid JsonWeb Token!';
    err = new ErrorHandler(message, 404);
  }
  if (err.name === 'TokenExpiredError') {
    const message = 'Json Web token expire!';
    err = new ErrorHandler(message, 400);
  }
  // MongoDB duplicate key error (code 11000, not statusCode)
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  const errMessage = err.errors
    ? Object.values(err.errors)
        .map(error => error.message)
        .join('')
    : err.message;

  return res.status(err.statusCode).json({
    success: false,
    message: errMessage,
  });
};

module.exports = { errorMiddleware, ErrorHandler };
