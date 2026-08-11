const slugify = require('slugify');
const prisma = require('../config/prisma');
const { ok, fail } = require('../utils/apiResponse');
const { clean } = require('../utils/sanitize');

function toSlug(titleOrSlug) {
  return slugify(titleOrSlug, { lower: true, strict: true, trim: true });
}

async function uniqueSlug(baseSlug, ignoreFormId) {
  let candidate = baseSlug || `form-${Date.now()}`;
  let suffix = 1;
  while (await prisma.form.findFirst({
    where: {
      slug: candidate,
      ...(ignoreFormId ? { NOT: { id: ignoreFormId } } : {})
    }
  })) {
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
  return candidate;
}

function formatField(field) {
  return {
    field_type: field.field_type,
    label: field.label,
    placeholder: field.placeholder || null,
    options: field.options || null,
    validation_rules: field.validation_rules || null,
    order_index: Number(field.order_index),
    is_required: Boolean(field.is_required)
  };
}

async function ensureOwnedForm(formId, adminId) {
  return prisma.form.findFirst({ where: { id: Number(formId), admin_id: adminId } });
}

async function createForm(req, res) {
  const input = clean(req.body);
  const baseSlug = toSlug(input.slug || input.title);
  const slug = await uniqueSlug(baseSlug);

  const form = await prisma.form.create({
    data: {
      admin_id: req.user.id,
      title: input.title,
      description: input.description || null,
      slug,
      status: input.status || 'draft',
      theme_config: input.theme_config || null,
      fields: { create: (input.fields || []).map(formatField) }
    },
    include: { fields: { orderBy: { order_index: 'asc' } } }
  });

  return ok(res, form, 201);
}

async function listForms(req, res) {
  const where = { admin_id: req.user.id };
  if (req.query.status) where.status = req.query.status;
  if (req.query.search) {
    where.OR = [
      { title: { contains: req.query.search } },
      { description: { contains: req.query.search } }
    ];
  }

  const forms = await prisma.form.findMany({
    where,
    orderBy: { updated_at: 'desc' },
    include: { _count: { select: { responses: true, fields: true } } }
  });
  return ok(res, forms);
}

async function getForm(req, res) {
  const form = await prisma.form.findFirst({
    where: { id: Number(req.params.id), admin_id: req.user.id },
    include: { fields: { orderBy: { order_index: 'asc' } } }
  });
  if (!form) return fail(res, { message: 'Form not found' }, 404);
  return ok(res, form);
}

async function updateForm(req, res) {
  const existing = await ensureOwnedForm(req.params.id, req.user.id);
  if (!existing) return fail(res, { message: 'Form not found' }, 404);

  const input = clean(req.body);
  const form = await prisma.$transaction(async (tx) => {
    await tx.formField.deleteMany({ where: { form_id: existing.id } });
    return tx.form.update({
      where: { id: existing.id },
      data: {
        title: input.title,
        description: input.description || null,
        slug: input.slug ? await uniqueSlug(toSlug(input.slug), existing.id) : existing.slug,
        status: input.status || existing.status,
        theme_config: input.theme_config || null,
        fields: { create: (input.fields || []).map(formatField) }
      },
      include: { fields: { orderBy: { order_index: 'asc' } } }
    });
  });

  return ok(res, form);
}

async function deleteForm(req, res) {
  const form = await ensureOwnedForm(req.params.id, req.user.id);
  if (!form) return fail(res, { message: 'Form not found' }, 404);
  await prisma.form.delete({ where: { id: form.id } });
  return ok(res, { message: 'Form deleted' });
}

async function duplicateForm(req, res) {
  const form = await prisma.form.findFirst({
    where: { id: Number(req.params.id), admin_id: req.user.id },
    include: { fields: { orderBy: { order_index: 'asc' } } }
  });
  if (!form) return fail(res, { message: 'Form not found' }, 404);

  const copy = await prisma.form.create({
    data: {
      admin_id: req.user.id,
      title: `${form.title} Copy`,
      description: form.description,
      slug: `${form.slug}-copy-${Date.now()}`,
      status: 'draft',
      theme_config: form.theme_config,
      fields: { create: form.fields.map(formatField) }
    },
    include: { fields: { orderBy: { order_index: 'asc' } } }
  });

  return ok(res, copy, 201);
}

async function togglePublish(req, res) {
  const form = await ensureOwnedForm(req.params.id, req.user.id);
  if (!form) return fail(res, { message: 'Form not found' }, 404);
  const updated = await prisma.form.update({
    where: { id: form.id },
    data: { status: form.status === 'published' ? 'draft' : 'published' }
  });
  return ok(res, updated);
}

module.exports = { createForm, listForms, getForm, updateForm, deleteForm, duplicateForm, togglePublish };
