const logger = require('../log/logger');

const errorLogger = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`);
  res.status(500).json({ message: 'Sunucu hatası!' });
};

module.exports = errorLogger;
