import User from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

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
    .then(user => {
        if (!user) {
            return res.status(401).end(formatErrorForResponse(new Error('User not found')));
        }
        bcrypt.compare(req.body.password, user.password)
        .then(valid => {
            if (!valid) {
                return res.status(401).end(formatErrorForResponse(new Error('Incorrect password')));
            }
            res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                    { userId: user._id },
                    'RANDOM_TOKEN_SECRET',
                    { expiresIn: '24h' }
                )
            });
        })
        .catch(error => res.status(500).end(formatErrorForResponse(error)));
    })
    .catch(error => res.status(500).end(formatErrorForResponse(error)));
}