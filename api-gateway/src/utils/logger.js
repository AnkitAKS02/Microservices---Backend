import winston from 'winston';

const logger = winston.createLogger({
    /*Winston levels (by priority):
error → warn → info → http → verbose → debug → silly
    */
    /* If level is "info" → only info, warn, error logs appear.
If level is "debug" → everything (including debug messages) appears.*/
    level: process.env.NOV_ENV === 'production' ? 'info' : 'debug',
    //this tells how the logs look
    format: winston.format.combine(
        winston.format.timestamp(),//adds a timestamp to every log
        winston.format.errors({ stack: true }),
        //allow to use printf-style formating ,eg:
        //logger.info("User %s logged in from %s", username, location);
        winston.format.splat(),
        winston.format.json()//output in json formate
    ),
    defaultMeta: { service: 'api-gateway' }, 
    //Each transport is a destination (console, file, DB, etc.).
    transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
})

export default logger;