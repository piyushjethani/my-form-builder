const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { jwtSecret, jwtExpiresIn } = require('../config/env');
const { ok, fail } = require('../utils/apiResponse');
const { clean } = require('../utils/sanitize');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, jwtSecret, { expiresIn: jwtExpiresIn });
}

async function register(req, res) {
  const input = clean(req.body);
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) return fail(res, { message: 'Email is already registered' }, 409);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password_hash: await bcrypt.hash(input.password, 10),
      role: input.role || 'user'
    },
    select: { id: true, name: true, email: true, role: true, created_at: true }
  });

  return ok(res, { user, token: signToken(user) }, 201);
}

async function login(req, res) {
  const input = clean(req.body);
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.password_hash))) {
    return fail(res, { message: 'Invalid email or password' }, 401);
  }

  const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at };
  return ok(res, { user: safeUser, token: signToken(user) });
}

module.exports = { register, login };
