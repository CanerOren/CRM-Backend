const logger = require('../log/logger');

const sensitiveKeys = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'downloadToken',
];
function sanitize(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  return Object.keys(obj).reduce((acc, key) => {
    if (sensitiveKeys.includes(key)) {
      acc[key] = '[REDACTED]';
    } else {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
}

const requestLogger = (req, res, next) => {
  const sanitizedBody = sanitize(req.body);
  const sanitizedQuery = sanitize(req.query);
  const sanitizedParams = sanitize(req.params);
  const logPayload = {
    method: req.method,
    url: req.originalUrl,
    params: sanitizedParams,
    query: sanitizedQuery,
    body: sanitizedBody,
  };
  logger.info(logPayload);
  next();
};

module.exports = requestLogger;
