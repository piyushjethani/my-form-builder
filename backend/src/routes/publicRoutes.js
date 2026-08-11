const router = require('express').Router();
const { getPublishedForm, submitResponse } = require('../controllers/publicController');
const { validate } = require('../middleware/errorHandler');
const { publicSubmitLimiter } = require('../middleware/rateLimiter');
const { slugParamRules, submitResponseRules } = require('../validators/formValidators');
const asyncHandler = require('../utils/asyncHandler');

router.get('/forms/:slug', slugParamRules, validate, asyncHandler(getPublishedForm));
router.post('/forms/:slug/responses', publicSubmitLimiter, submitResponseRules, validate, asyncHandler(submitResponse));

module.exports = router;
