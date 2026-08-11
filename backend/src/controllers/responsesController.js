const { createObjectCsvStringifier } = require('csv-writer');
const prisma = require('../config/prisma');
const { ok, fail } = require('../utils/apiResponse');

async function requireOwnedForm(formId, adminId) {
  return prisma.form.findFirst({
    where: { id: Number(formId), admin_id: adminId },
    include: { fields: { orderBy: { order_index: 'asc' } } }
  });
}

function responseWhere(formId, query) {
  const where = { form_id: Number(formId) };
  if (query.startDate || query.endDate) {
    where.submitted_at = {};
    if (query.startDate) where.submitted_at.gte = new Date(query.startDate);
    if (query.endDate) where.submitted_at.lte = new Date(query.endDate);
  }
  if (query.fieldId && query.fieldValue) {
    where.answers = {
      some: {
        field_id: Number(query.fieldId),
        value: { equals: query.fieldValue }
      }
    };
  }
  return where;
}

async function listResponses(req, res) {
  const form = await requireOwnedForm(req.params.id, req.user.id);
  if (!form) return fail(res, { message: 'Form not found' }, 404);

  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const sort = req.query.sort || 'submitted_at';
  const order = req.query.order || 'desc';
  const where = responseWhere(form.id, req.query);

  const [total, responses] = await prisma.$transaction([
    prisma.response.count({ where }),
    prisma.response.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sort]: order },
      include: { answers: { include: { field: true } }, user: { select: { id: true, name: true, email: true } } }
    })
  ]);

  return ok(res, { page, limit, total, responses });
}

async function exportResponses(req, res) {
  const form = await requireOwnedForm(req.params.id, req.user.id);
  if (!form) return fail(res, { message: 'Form not found' }, 404);

  const responses = await prisma.response.findMany({
    where: responseWhere(form.id, req.query),
    orderBy: { submitted_at: 'desc' },
    include: { answers: true }
  });

  const header = [
    { id: 'response_id', title: 'response_id' },
    { id: 'submitted_at', title: 'submitted_at' },
    ...form.fields.map((field) => ({ id: `field_${field.id}`, title: field.label }))
  ];
  const csv = createObjectCsvStringifier({ header });
  const records = responses.map((response) => {
    const row = { response_id: response.id, submitted_at: response.submitted_at.toISOString() };
    for (const answer of response.answers) {
      row[`field_${answer.field_id}`] = Array.isArray(answer.value) || typeof answer.value === 'object'
        ? JSON.stringify(answer.value)
        : answer.value;
    }
    return row;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${form.slug}-responses.csv"`);
  return res.send(csv.getHeaderString() + csv.stringifyRecords(records));
}

async function analytics(req, res) {
  const form = await requireOwnedForm(req.params.id, req.user.id);
  if (!form) return fail(res, { message: 'Form not found' }, 404);

  const responses = await prisma.response.findMany({
    where: { form_id: form.id },
    include: { answers: true }
  });

  const countByDate = {};
  for (const response of responses) {
    const key = response.submitted_at.toISOString().slice(0, 10);
    countByDate[key] = (countByDate[key] || 0) + 1;
  }

  const optionDistribution = {};
  for (const field of form.fields.filter((item) => ['dropdown', 'radio', 'checkbox'].includes(item.field_type))) {
    optionDistribution[field.id] = { label: field.label, counts: {} };
    for (const response of responses) {
      const answer = response.answers.find((item) => item.field_id === field.id);
      const values = Array.isArray(answer?.value) ? answer.value : [answer?.value].filter(Boolean);
      for (const value of values) {
        optionDistribution[field.id].counts[value] = (optionDistribution[field.id].counts[value] || 0) + 1;
      }
    }
  }

  return ok(res, {
    totalResponses: responses.length,
    countByDate,
    optionDistribution
  });
}

module.exports = { listResponses, exportResponses, analytics };
