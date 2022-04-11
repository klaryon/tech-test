const { createLogger, format, transports } = require('winston');

const { NODE_ENV } = process.env;

const customFormat = format.printf(({ level, message, label, timestamp, stack }) => {
    if (message.constructor === Object) {
        message = JSON.stringify(message, null, 4)
      }
    return `[${level}] ${stack || message}`;
    // `${timestamp} [${level}] ${stack || message}`),
});

const logger = createLogger({
    level: NODE_ENV === 'production' ? 'info' : 'debug',
    transports: [
        new transports.Console({
            format: format.combine(
                // format.timestamp({
                //     format: 'YYYY-MM-DD HH:mm:ss'
                //   }),
                // format.colorize(),
                // format.json()
                format.simple(),
                customFormat,
            ),
          }),
        // new winston.transports.File({ filename: 'combined.log' })
    ]
});

module.exports = logger;


// module.exports = createLogger({
// transports:
//     new transports.File({
//     filename: 'logs/server.log',
//     format:format.combine(
//         format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
//         format.align(),
//         format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
//     )}),
// });