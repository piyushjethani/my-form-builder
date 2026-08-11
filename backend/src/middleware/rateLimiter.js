const rateLimit = require('express-rate-limit');
const { fail } = require('../utils/apiResponse');

const publicSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => fail(res, { message: 'Too many submissions. Please try again later.' }, 429)
});

module.exports = { publicSubmitLimiter };
