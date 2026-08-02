// Wraps an async Express handler so a rejected promise is forwarded to
// next(err) instead of crashing the process as an unhandled rejection.
module.exports = function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
