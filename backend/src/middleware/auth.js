const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { jwtSecret } = require('../config/env');
const { fail } = require('../utils/apiResponse');

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, { message: 'Authentication token required' }, 401);

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, role: true }
    });
    if (!user) return fail(res, { message: 'Invalid authentication token' }, 401);
    req.user = user;
    next();
  } catch (error) {
    return fail(res, { message: 'Invalid or expired authentication token' }, 401);
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return fail(res, { message: 'Admin access required' }, 403);
  next();
}

module.exports = { authenticate, requireAdmin };
