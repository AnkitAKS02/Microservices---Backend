import dotenv from 'dotenv';
import express from 'express'
import Redis from 'ioredis'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import logger from './utils/logger.js'
import proxy from 'express-http-proxy' 
import errorHandler from './middleware/errorHandler.js'
import validateToken from './middleware/validation.js';
const app = express();
const PORT = process.env.PORT || 3000;
dotenv.config()
const redisClient = new Redis(process.env.REDIS_URL);

app.use(helmet())
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use(rateLimiter);

const proxyOptions = {
    proxyReqPathResolver: (req) => {
        return req.originalUrl.replace(/^\/v1/, "/api");
    },
    proxyErrorHandler: (err, res, next) => {
        logger.error(`proxy error : ${err.message}`)

        res.status(500).json({
            message:'Internal Server Error',error:err.message,
        });
    },
}

//setting the proxy for identity services
app.use('/v1/auth', proxy(process.env.IDENTITY_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response received from post service: ${proxyRes.statusCode}`
        );
        return proxyResData;
    },
})
);

app.use('/v1/posts',validateToken, proxy(process.env.PROCESS_SERVICE_URL, {
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["Content-Type"] = "application/json";
        proxyReqOpts.headers["user-id"] = srcReq.user.userId;
        return proxyReqOpts;
    },
    userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(
            `Response received from Identity service: ${proxyRes.statusCode}`
        );
        return proxyResData;
    },
})
);


//now validate token will be used at every other services that will be created later on:
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway is running on port:${PORT}`);
    logger.info(`Identity service is running on port:${process.env.IDENTITY_SERVICE_URL}`);
    logger.info(`Redis is running on port:${process.env.REDIS_URL}`);

})
