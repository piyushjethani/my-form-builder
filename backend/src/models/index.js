const prisma = require('../config/prisma');

module.exports = {
  prisma,
  user: prisma.user,
  form: prisma.form,
  formField: prisma.formField,
  response: prisma.response,
  responseAnswer: prisma.responseAnswer
};
