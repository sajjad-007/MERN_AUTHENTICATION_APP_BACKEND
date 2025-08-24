const asyncErrorCatcher = function (TheFunction) {
  return (req, res, next) => {
    Promise.resolve(TheFunction(req, res, next)).catch(next);
  };
};

module.exports = { asyncErrorCatcher };
