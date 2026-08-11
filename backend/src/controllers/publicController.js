const prisma = require('../config/prisma');
const { ok, fail } = require('../utils/apiResponse');
const { clean } = require('../utils/sanitize');

async function getPublishedForm(req, res) {
  const form = await prisma.form.findFirst({
    where: { slug: req.params.slug, status: 'published' },
    include: { fields: { orderBy: { order_index: 'asc' } } }
  });
  if (!form) return fail(res, { message: 'Published form not found' }, 404);
  return ok(res, form);
}

async function submitResponse(req, res) {
  const input = clean(req.body);
  const form = await prisma.form.findFirst({
    where: { slug: req.params.slug, status: 'published' },
    include: { fields: true }
  });
  if (!form) return fail(res, { message: 'Published form not found' }, 404);

  const fieldMap = new Map(form.fields.map((field) => [field.id, field]));
  const answers = input.answers || [];

  for (const field of form.fields) {
    if (field.is_required && !answers.some((answer) => Number(answer.field_id) === field.id && answer.value !== undefined && answer.value !== '')) {
      return fail(res, { message: `${field.label} is required` }, 422);
    }
  }

  for (const answer of answers) {
    if (!fieldMap.has(Number(answer.field_id))) {
      return fail(res, { message: 'Submitted answer contains an invalid field' }, 422);
    }
  }

  const response = await prisma.response.create({
    data: {
      form_id: form.id,
      submitted_by: input.submitted_by || null,
      answers: {
        create: answers.map((answer) => ({
          field_id: Number(answer.field_id),
          value: answer.value
        }))
      }
    },
    include: { answers: true }
  });

  return ok(res, response, 201);
}

module.exports = { getPublishedForm, submitResponse };
