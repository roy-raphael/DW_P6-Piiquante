import {formatErrorForResponse} from '../utils/error-utils.js'
import Sauce from '../models/sauce.js';

// Check if the user has the right to modify the sauce
function authoriseForSauce(req, res, next) {
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

export default authoriseForSauce;