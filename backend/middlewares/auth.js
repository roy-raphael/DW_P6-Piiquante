import jwt from 'jsonwebtoken';
import {formatErrorForResponse} from '../utils/error-utils.js'

export default function authorise(req, res, next) {
    try {
        const tokenAuth = req.headers.authorization;
        if (tokenAuth === undefined) {
            throw new Error('No token provided (for authentication)');
        }
        const token = tokenAuth.split(' ')[1];
        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
        const userId = decodedToken.userId;
        req.auth = { userId };
        if (req.body.userId && req.body.userId !== userId) {
            throw new Error('Invalid user ID (for authentication)');
        } else {
            next();
        }
    } catch(error) {
        res.status(401).end(formatErrorForResponse(error));
    }
}