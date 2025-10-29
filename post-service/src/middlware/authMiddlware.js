import logger from '../utils/logger.js'

const autheticateRequest = (req, res, next) => {
    const userId = req.headers['user-id'];

    if (!userId) {
        logger.warn("You can not aceess this service without userId");
        return res.status(401).json({
            success: false,
            message: "Authencation required! Please login to continue",
        });
    }

    req.user = { userId };
    next();
}

export default autheticateRequest;