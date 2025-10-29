import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import Redis from 'ioredis'
import cors from 'cors'
import helmet from 'helmet'
import postRoute from './routes/post.route.js'
import errorHandler from './middlware/errorHandler.js'
import logger from './utils/logger.js'


const app = express();
const PORT = process.env.PORT || 3002;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => logger.info("Connected to mongodb"))
    .catch((e) => logger.error("Mongo connection error", e));
  
const redisClient = new Redis(process.env.REDIS_URL);
//middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

//implemet ip based rate imiting

app.use('/api/posts', (req, res, next) => {
  req.redisClient = redisClient,
    next();
}, postRoute);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Post Service Runninfgat ${PORT}`);
})

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at', promise, "reason:", reason);
})

