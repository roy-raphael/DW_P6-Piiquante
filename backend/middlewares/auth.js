import jwt from 'jsonwebtoken';
import {formatErrorForResponse} from '../utils/error-utils.js'
import Sauce from '../models/sauce.js';

export function authorise(req, res, next) {
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

// Check if the user has the right to modify the sauce
export function authoriseForSauce(req, res, next) {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        if (!sauce) {
            res.status(404).json({ message: 'No sauce found with this ID'})
        }
        else if (sauce.userId !== req.auth.userId) {
            res.status(403).json({ message: 'Unauthorized request'})
        }
        else {
            req.sauce = sauce;
            next();
        }
    })
    .catch(error => res.status(500).end(formatErrorForResponse(error)));
}