const router = require('express').Router();
const { register, login } = require('../controllers/authController');
const { registerRules, loginRules } = require('../validators/authValidators');
const { validate } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', registerRules, validate, asyncHandler(register));
router.post('/login', loginRules, validate, asyncHandler(login));

module.exports = router;
