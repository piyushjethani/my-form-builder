const { body, param, query } = require('express-validator');

const fieldTypes = ['text', 'textarea', 'number', 'email', 'dropdown', 'checkbox', 'radio', 'date', 'file'];

const fieldRules = [
  body('fields').optional().isArray(),
  body('fields.*.field_type').isIn(fieldTypes),
  body('fields.*.label').isString().trim().isLength({ min: 1, max: 255 }),
  body('fields.*.placeholder').optional({ nullable: true }).isString().trim().isLength({ max: 255 }),
  body('fields.*.options').optional({ nullable: true }).custom((value) => Array.isArray(value) || typeof value === 'object'),
  body('fields.*.validation_rules').optional({ nullable: true }).isObject(),
  body('fields.*.order_index').isInt({ min: 0 }),
  body('fields.*.is_required').optional().isBoolean()
];

const createFormRules = [
  body('title').isString().trim().isLength({ min: 1, max: 255 }),
  body('description').optional({ nullable: true }).isString(),
  body('slug').optional().isString().trim().isLength({ min: 1, max: 255 }),
  body('status').optional().isIn(['draft', 'published']),
  body('theme_config').optional({ nullable: true }).isObject(),
  ...fieldRules
];

const updateFormRules = [
  param('id').isInt({ min: 1 }),
  ...createFormRules
];

const idParamRules = [param('id').isInt({ min: 1 })];
const slugParamRules = [param('slug').isString().trim().notEmpty()];

const listRules = [
  query('status').optional().isIn(['draft', 'published']),
  query('search').optional().isString().trim()
];

const responsesRules = [
  param('id').isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['submitted_at', 'id']),
  query('order').optional().isIn(['asc', 'desc']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601()
];

const submitResponseRules = [
  param('slug').isString().trim().notEmpty(),
  body('submitted_by').optional({ nullable: true }).isInt({ min: 1 }),
  body('answers').isArray({ min: 1 }),
  body('answers.*.field_id').isInt({ min: 1 }),
  body('answers.*.value').exists()
];

module.exports = {
  createFormRules,
  updateFormRules,
  idParamRules,
  slugParamRules,
  listRules,
  responsesRules,
  submitResponseRules
};
