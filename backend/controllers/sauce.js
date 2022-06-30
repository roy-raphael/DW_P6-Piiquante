import Sauce from '../models/sauce.js';
import fs from 'fs';

/*
 * @oas [post] /api/sauces
 * tags: ["sauces"]
 * summary: Creation of a new sauce
 * description: >
 *  Capture et enregistre l'image, analyse la sauce transformée en chaîne de caractères et
 *  l'enregistre dans la base de données en définissant correctement son imageUrl. 
 *  Initialise les likes et dislikes de la sauce à 0 et les usersLiked et usersDisliked
 *  avec des tableaux vides. Remarquez que le corps de la demande initiale est vide ; 
 *  lorsque multer est ajouté, il renvoie une chaîne pour le corps de la demande
 *  en fonction des données soumises avec le fichier.
 * requestBody:
 *  required: true
 *  content:
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
 *      example: TODO
 * responses:
 *  "201":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: "string"
 *          description: Message de création d'une sauce
 *        example: Objet enregistré
 *  "400":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 */
// IN : { sauce: String, image: File }
// OUT: { message: String }
export function createSauce(req, res, next) {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [],
        usersDisliked: []
    });
    sauce.save()
    .then(() => res.status(201).json({ message: 'Objet enregistré !'}))
    .catch(error => res.status(400).json({ error }));
}

/*
 * @oas [post] /api/sauces/{id}
 * tags: ["sauces"]
 * summary: Modification of a sauce
 * description: >
 *  Met à jour la sauce avec l'_id fourni. Si une image est téléchargée, elle est capturée et
 *  l’imageUrl de la sauce est mise à jour. Si aucun fichier n'est fourni,
 *  les informations sur la sauce se trouvent directement dans le corps de la requête
 *  (req.body.name, req.body.heat, etc.). Si un fichier est fourni, la sauce transformée
 *  en chaîne de caractères se trouve dans req.body.sauce. Notez que le corps de la demande
 *  initiale est vide ; lorsque multer est ajouté, il renvoie une chaîne du corps
 *  de la demande basée sur les données soumises avec le fichier.
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * requestBody:
 *  required: true
 *  content:
 *    application/json:
 *      schema:
 *        $ref: "#/components/schemas/sauce-form"
 *      example: TODO
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
 *      example: TODO
 * responses:
 *  "200":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: "string"
 *          description: Message de modification d'une sauce
 *        example: Objet modifié
 *  "400":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 */
// IN : EITHER Sauce as JSON OR { sauce: String, image: File }
// OUT: { message: String }
export function modifySauce(req, res, next) {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Objet modifié !'}))
    .catch(error => res.status(400).json({ error }));
}

/*
 * @oas [delete] /api/sauces/{id}
 * tags: ["sauces"]
 * summary: Deletion of a sauce
 * description: Supprime la sauce avec l'_id fourni
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * responses:
 *  "200":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: "string"
 *          description: Message de suppression d'une sauce
 *        example: Objet supprimé
 *  "401":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 *  "404":
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
// OUT: { message: String }
export function deleteSauce(req, res, next) {
    Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
        if (!sauce) {
            console.log('No such Sauce!');
            res.status(404).json({ error: 'No such Sauce!' });
        }
        else if (sauce.userId !== req.auth.userId) {
            res.status(401).json({ error: 'Unauthorized request!' });
        }
        else {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                .then(() => res.status(200).json({ message: 'Deleted!'}))
                .catch(error => res.status(401).json({ error }));
            });
        }
    })
    .catch(error => res.status(500).json({ error }));
}

/*
 * @oas [get] /api/sauces/{id}
 * tags: ["sauces"]
 * summary: Find a sauce by ID
 * description: Renvoie la sauce avec l’_id fourni
 * parameters:
 *  - $ref: "#/components/parameters/sauceIdParam"
 * responses:
 *  "200":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/sauce"
 *        example: TODO
 *  "404":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 */
// OUT: Single sauce
export function getOneSauce(req, res, next) {
    Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
}

/*
 * @oas [get] /api/sauces
 * tags: ["sauces"]
 * summary: Find all sauces
 * description: Renvoie un tableau de toutes les sauces de la base de données
 * responses:
 *  "200":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: array
 *          items:
 *            $ref: "#/components/schemas/sauce"
 *        example: TODO
 *  "400":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 */
// OUT: Array of sauces
export function getAllSauces(req, res, next) {
    Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
}

/*
 * @oas [post] /api/sauces/{id}/like
 * tags: ["sauces"]
 * summary: Sets the like status of a sauce for a user
 * description: >
 *  Définit le statut « Like » pour l' userId fourni.
 *  Si like = 1, l'utilisateur aime (= like) la sauce.
 *  Si like = 0, l'utilisateur annule son like ou son dislike.
 *  Si like = -1, l'utilisateur n'aime pas (= dislike) la sauce.
 *  L'ID de l'utilisateur doit être ajouté ou retiré du tableau approprié.
 *  Cela permet de garder une trace de leurs préférences et les empêche de liker ou
 *  de ne pas disliker la même sauce plusieurs fois :
 *  un utilisateur ne peut avoir qu'une seule valeur pour chaque sauce.
 *  Le nombre total de « Like » et de « Dislike » est mis à jour à chaque nouvelle notation.
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
 *            description: TODO
 *          like:
 *            type: number
 *            description: TODO
 *            minimum: -1
 *            maximum: 1
 *            enum: [-1, 0, 1]
 *      example: TODO
 * responses:
 *  "200":
 *    description: "OK"
 *    content:
 *      application/json:
 *        schema:
 *          type: "string"
 *          description: Message de définition du statut like d'une sauce
 *        example: Etat de statut de like de sauce modifié !
 *  "400":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
 *  "404":
 *    description: TODO
 *    content:
 *      application/json:
 *        schema:
 *          $ref: "#/components/schemas/errorMessage"
 *        example: TODO
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
        .then(() => res.status(200).json({ message: 'Etat de statut de like de sauce modifié !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(404).json({ error }));
}