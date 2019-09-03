var winston = require('winston');
require('winston-daily-rotate-file');
 
  var transport = new (winston.transports.DailyRotateFile)({
    filename: 'log/adminwebapp-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '1d'
  });
 
  transport.on('rotate', function(oldFilename, newFilename) {
    // 
  });


const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
   
    transports: [
      transport
    //   // - Write to all logs with level `info` and below to `combined.log` 
    //   // - Write all logs error (and below) to `error.log`.
    //   //
     
    //  // new winston.transports.File({ filename: 'log/Adminwebapp.log' })
    ]
  });
  
  //
  // If we're not in production then log to the `console` with the format:
  // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
  // 
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }

  logger.stream = {
    write: function(message, encoding) {
      // use the 'info' log level so the output will be picked up by both transports (file and console)
      logger.info(message);
    },
  };
  
  module.exports = logger;