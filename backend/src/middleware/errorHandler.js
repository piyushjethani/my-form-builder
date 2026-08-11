const { validationResult } = require('express-validator');
const { fail } = require('../utils/apiResponse');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, { message: 'Validation failed', details: errors.array() }, 422);
  }
  next();
}

function notFound(req, res) {
  return fail(res, { message: 'Route not found' }, 404);
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  return fail(res, { message: err.message || 'Internal server error' }, status);
}

module.exports = { validate, notFound, errorHandler };
