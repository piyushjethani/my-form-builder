const { body } = require('express-validator');

const registerRules = [
  body('name').isString().trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isString().isLength({ min: 8 }),
  body('role').optional().isIn(['admin', 'user'])
];

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isString().notEmpty()
];

module.exports = { registerRules, loginRules };
