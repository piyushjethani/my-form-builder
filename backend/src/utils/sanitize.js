const xss = require('xss');

function clean(value) {
  if (typeof value === 'string') return xss(value.trim());
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
  }
  return value;
}

module.exports = { clean };
