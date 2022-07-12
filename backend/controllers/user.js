import User from '../models/user.js';
import bcrypt from 'bcrypt';
import rateLimiter from 'rate-limiter-flexible';
import {formatErrorForResponse} from '../utils/error-utils.js'
import {sign} from '../utils/jwt-utils.js'

/*
 * @oas [post] /api/auth/signup
 * tags: ["auth"]
 * summary: Creation of a new user
 * description: Hachage du mot de passe de l'utilisateur, ajout de l'utilisateur à la base de données
 * requestBody:
 *  required: true
 *  content:
 *    application/json:
 *      schema:
 *        $ref: "#/components/schemas/user"
 * responses:
 *  "201":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: "string"
 *          description: Message de création d'utilisateur
 *        example: Utilisateur créé
 *  "400":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 *  "500":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 */
// IN : { email: string, password: string }
// OUT: { message: string }
export function signup(req, res, next) {
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        const user = new User({
            email: req.body.email,
            password: hash
        });
        user.save()
        .then(() => res.status(201).json({ message: 'User created' }))
        .catch(error => res.status(400).end(formatErrorForResponse(error)));
    })
    .catch(error => res.status(500).end(formatErrorForResponse(error)));
}

/*
 * @oas [post] /api/auth/login
 * tags: ["auth"]
 * summary: Connexion of a user
 * description: >
 *   Vérification des informations d'identification de l'utilisateur, renvoie l _id de
 *   l'utilisateur depuis la base de données et un token web JSON signé
 *   (contenant également l'_id de l'utilisateur).
 *   Une limitation du nombre de tentatives de connexions par utilisateur est mise en place.
 * requestBody:
 *  required: true
 *  content:
 *    application/json:
 *      schema:
 *        $ref: "#/components/schemas/user"
 * responses:
 *  "200":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: "object"
 *          properties:
 *            userId:
 *              type: string
 *              description: ID de l'utilisateur (depuis la base de données)
 *            token:
 *              type: string
 *              description: token web JSON signé (contenant également l'ID de l'utilisateur)
 *        example: TODO
 *  "401":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 *  "429":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 *  "500":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 */
// IN : { email: string, password: string }
// OUT: { userId: string, token: string }
export function login(req, res, next) {
    User.findOne({ email: req.body.email })
    .then(async user => {
        if (!user) {
            return res.status(401).end(formatErrorForResponse(new Error('User not found')));
        }
        // Sign in the user
        let userIsLoggedIn = false;
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).end(formatErrorForResponse(new Error('Incorrect password')));
            }
            var token = sign({ userId: user._id }, req.body.email);
            res.status(200).json({
                userId: user._id,
                token: token
            });
            userIsLoggedIn = true;
        })
        .catch(error => res.status(500).end(formatErrorForResponse(error)));
        // Update the login rate limiters
        const userEmail = req.body.email;
        if (userIsLoggedIn) {
            await loginConsecutiveLimiter.delete(userEmail);
        } else {
            try {
                const userConsecutiveLimiterRes = await loginConsecutiveLimiter.get(userEmail);
                const globalConsumedPoints = userConsecutiveLimiterRes == null ? 1 : 5;
                const resConsume = await loginLimiter.consume(userEmail, globalConsumedPoints);
                if (resConsume.remainingPoints <= 0) {
                    const resPenalty = await loginConsecutiveLimiter.penalty(userEmail);
                    const fibonacciBlockDurationSeconds = 60 * getFibonacciBlockDurationMinutes(resPenalty.consumedPoints);
                    await loginLimiter.block(userEmail, fibonacciBlockDurationSeconds);
                    res.set('Retry-After', String(fibonacciBlockDurationSeconds) || 1);
                }
            } catch (rlRejected) {
    
                if (rlRejected instanceof Error) {
                    throw rlRejected;
                } else {
                    res.set('Retry-After', String(Math.round(rlRejected.msBeforeNext / 1000)) || 1);
                    res.status(429).end('Too Many Requests');
                }
            }
        }
    })
    .catch(error => res.status(500).end(formatErrorForResponse(error)));
}

export async function loginRateLimiter(req, res, next) {
    const resById = await loginLimiter.get(req.body.email);
    let retrySecs = 0;
  
    if (resById !== null && resById.remainingPoints <= 0) {
      retrySecs = Math.round(resById.msBeforeNext / 1000) || 1;
    }
  
    if (retrySecs > 0) {
      res.set('Retry-After', String(retrySecs));
      res.status(429).end('Too Many Requests');
    } else {
        next();
    }
}

const loginLimiter = new rateLimiter.RateLimiterMemory({
    keyPrefix: 'login',
    points: 5, // 5 attempts
    duration: 60, // within 1 minute
});

const loginConsecutiveLimiter = new rateLimiter.RateLimiterMemory({
  keyPrefix: 'login_consecutive_limiter',
  points: 99999, // doesn't matter much, this is just counter
  duration: 0, // never expire
});

function getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits) {
    if (countConsecutiveOutOfLimits <= 1) {
      return 1;
    }
    return getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits - 1) + getFibonacciBlockDurationMinutes(countConsecutiveOutOfLimits - 2);
}