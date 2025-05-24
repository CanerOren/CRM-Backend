const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const dailyRotateTransport = new DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'DD-MM-YYYY',
  zipped: false,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] ${level}: ${typeof message === 'object' ? JSON.stringify(message, null, 2) : message}`;
        }),
      ),
    }),
    dailyRotateTransport,
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
  ],
});
module.exports = logger;
