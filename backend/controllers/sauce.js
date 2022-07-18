import fs from 'fs';
import {formatErrorForResponse} from '../utils/error-utils.js'
import Sauce from '../models/sauce.js';

const SAUCES_IMAGES_SAVE_PATH = 'images';

/*
 * @oas [post] /api/sauces
 * tags: ["sauces"]
 * summary: Creation of a new sauce
 * description: >
 *  Capture and save the image, analyze the sauce (transformed into string) and 
 *  save it in the datbase (with the right imageUrl). Initialize likes and dislikes 
 *  of the sauce to 0, and usersLiked and usersDisliked with empty arrays.
 *  The initial request body is empty ; multer returns a string for the request body
 *  with the data submitted with the file.
 * requestBody:
 *  required: true
 *  content:
 *    multipart/form-data:
 *      schema:
 *        type: object
 *        properties:
 *          sauce:
 *            $ref: "#/components/schemas/sauce-form"
 *          file:
 *            type: string
 *            format: binary
 *            description: image to upload
 * responses:
 *  "201":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          type: string
 *          description: Sauce creation message
 *        example: Sauce created
 *  "400":
 *    description: Bad request
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "401":
 *    description: Unauthorized
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 */
// IN : { sauce: String, image: File }
// OUT: { message: String }
export function createSauce(req, res, next) {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/${SAUCES_IMAGES_SAVE_PATH}/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce created'}))
    .catch(error => res.status(400).end(formatErrorForResponse(error)));
}

/*
 * @oas [put] /api/sauces/{id}
 * tags: ["sauces"]
 * summary: Modification of a sauce
 * description: >
 *  Update the sauce with the _id submitted.
 *  If an image is uploaded, it is captured, and the imageUrl of the sauce is updated.
 *  If no file is submitted, the informations of the sauce are in the root of the request body.
 *  If a file is submitted, the sauce (string) is in req.body.sauce
 *  The initial raquest body is empty ; multer returns a string for the request body
 *  with the data submitted with the file.
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * requestBody:
 *  required: true
 *  content:
 *    application/json:
 *      schema:
 *        $ref: "#/components/schemas/sauce-form"
 *      example:
 *        name: Oaxacan
 *        manufacturer: Cajohns Fiery Foods Company
 *        description: A sauce from Latin America
 *        mainPepper: Black Pepper
 *        heat: 4
 *        userId: e5268c386c9b17c39bd6a17d
 *    multipart/form-data:
 *      schema:
 *        type: "object"
 *        properties:
 *          sauce:
 *            $ref: "#/components/schemas/sauce-form"
 *          file:
 *            type: string
 *            format: binary
 *            description: image to upload
 * responses:
 *  "200":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          type: string
 *          description: Sauce modification message
 *        example: Sauce updated
 *  "400":
 *    description: Bad request
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "401":
 *    description: Unauthorized
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "403":
 *    description: Forbidden
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "404":
 *    description: Not Found
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 */
// IN : EITHER Sauce as JSON OR { sauce: String, image: File }
// OUT: { message: String }
export function modifySauce(req, res, next) {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/${SAUCES_IMAGES_SAVE_PATH}/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => {
        var responseStatus = 200;
        var responseContent = { message: 'Sauce updated'};
        if (req.file) {
            var filename = req.sauce.imageUrl.split(`/${SAUCES_IMAGES_SAVE_PATH}/`)[1];
            fs.unlink(`${SAUCES_IMAGES_SAVE_PATH}/${filename}`, (error) => {
                if (error) {
                    console.error(error);
                }
                res.status(responseStatus).json(responseContent);
            });
        } else {
            res.status(responseStatus).json(responseContent);
        }
    })
    .catch(error => res.status(400).end(formatErrorForResponse(error)));
}

/*
 * @oas [delete] /api/sauces/{id}
 * tags: ["sauces"]
 * summary: Deletion of a sauce
 * description: Delete the sauce with the given _id
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * responses:
 *  "200":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          type: string
 *          description: Sauce deletion message
 *        example: Sauce deleted
 *  "401":
 *    description: Unauthorized
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "403":
 *    description: Forbidden
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "404":
 *    description: Not Found
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 */
// OUT: { message: String }
export function deleteSauce(req, res, next) {
    const filename = req.sauce.imageUrl.split(`/${SAUCES_IMAGES_SAVE_PATH}/`)[1];
    fs.unlink(`${SAUCES_IMAGES_SAVE_PATH}/${filename}`, (error) => {
        if (error) {
            console.error(error);
        }
        Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce deleted'}))
        .catch(error => res.status(401).end(formatErrorForResponse(error)));
    });
}

/*
 * @oas [get] /api/sauces/{id}
 * tags: ["sauces"]
 * summary: Find a sauce by ID
 * description: Returns the sauce with the given _id
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * responses:
 *  "200":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/sauce"
 *  "401":
 *    description: Unauthorized
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "404":
 *    description: Not Found
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 */
// OUT: Single sauce
export function getOneSauce(req, res, next) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).end(formatErrorForResponse(error)));
}

/*
 * @oas [get] /api/sauces
 * tags: ["sauces"]
 * summary: Find all sauces
 * description: Returns an array of all the sauces in the database
 * responses:
 *  "200":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/components/schemas/sauce"
 *  "400":
 *    description: Bad request
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "401":
 *    description: Unauthorized
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 */
// OUT: Array of sauces
export function getAllSauces(req, res, next) {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).end(formatErrorForResponse(error)));
}

/*
 * @oas [post] /api/sauces/{id}/like
 * tags: ["sauces"]
 * summary: Sets the like status of a sauce for a user
 * description: >
 *  Define the "like" status of a given userId for a sauce
 *  If like = 1, the user likes the sauce.
 *  If like = 0, the user cancels its like or dislike (neutral).
 *  If like = -1, the user dislikes the sauce.
 *  The ID of the user is added (or removed) to the right array.
 *  A user can only have one (and only one) value for each sauce.
 *  The total number of likes and dislikes is updated after each new rating.
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * requestBody:
 *  required: true
 *  content:
 *    application/json:
 *      schema:
 *        type: "object"
 *        properties:
 *          userId:
 *            type: string
 *            description: ID of the user
 *          like:
 *            type: number
 *            description: new like status of the sauce for the user (-1 dislike / 0 neutral / 1 like)
 *            minimum: -1
 *            maximum: 1
 *            enum: [-1, 0, 1]
 *      example:
 *        userId: e5268c386c9b17c39bd6a17d
 *        like: 1
 * responses:
 *  "200":
 *    description: OK
 *    content:
 *      application/json:
 *        schema:
 *          type: string
 *          description: Sauce like status update message
 *        example: Sauce like status updated
 *  "400":
 *    description: Bad request
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "401":
 *    description: Unauthorized
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *  "404":
 *    description: Not Found
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 */
// IN : { userId: String, like: Number }
// OUT: { message: String }
export function likeSauce(req, res, next) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
        // Search the user in the likes/dislikes arrays and
        // remove the old like/dislike if found
        var likesArrayIndex = sauce.usersLiked.indexOf(req.body.userId);
        if (likesArrayIndex != -1) {
            sauce.usersLiked.splice(likesArrayIndex, 1);
            sauce.likes--;
        }
        var dislikesArrayIndex = sauce.usersDisliked.indexOf(req.body.userId);
        if (dislikesArrayIndex != -1) {
            sauce.usersDisliked.splice(dislikesArrayIndex, 1);
            sauce.dislikes--;
        }
        // Add the new like/dislike
        if (req.body.like === 1) {
            sauce.usersLiked.push(req.body.userId);
            sauce.likes++;
        } else if (req.body.like === -1) {
            sauce.usersDisliked.push(req.body.userId);
            sauce.dislikes++;
        }
        // Update the sauce on the database
        Sauce.updateOne({ _id: req.params.id }, sauce)
        .then(() => res.status(200).json({ message: 'Sauce like status updated'}))
        .catch(error => res.status(400).end(formatErrorForResponse(error)));
    })
    .catch(error => res.status(404).end(formatErrorForResponse(error)));
}