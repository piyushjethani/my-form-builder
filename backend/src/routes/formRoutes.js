const router = require('express').Router();
const forms = require('../controllers/formsController');
const responses = require('../controllers/responsesController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const {
  createFormRules,
  updateFormRules,
  idParamRules,
  listRules,
  responsesRules
} = require('../validators/formValidators');

router.use(authenticate, requireAdmin);

router.post('/', createFormRules, validate, asyncHandler(forms.createForm));
router.get('/', listRules, validate, asyncHandler(forms.listForms));
router.get('/:id', idParamRules, validate, asyncHandler(forms.getForm));
router.put('/:id', updateFormRules, validate, asyncHandler(forms.updateForm));
router.delete('/:id', idParamRules, validate, asyncHandler(forms.deleteForm));
router.post('/:id/duplicate', idParamRules, validate, asyncHandler(forms.duplicateForm));
router.patch('/:id/publish', idParamRules, validate, asyncHandler(forms.togglePublish));
router.get('/:id/responses', responsesRules, validate, asyncHandler(responses.listResponses));
router.get('/:id/responses/export', idParamRules, validate, asyncHandler(responses.exportResponses));
router.get('/:id/analytics', idParamRules, validate, asyncHandler(responses.analytics));

module.exports = router;
