import express from 'express';
import * as auth from '../middlewares/auth.js';
import multer from '../middlewares/multer-config.js';
import * as sauceCtrl  from '../controllers/sauce.js';

const router = express.Router();

router.get('/', auth.authorise, sauceCtrl.getAllSauces);
router.get('/:id', auth.authorise, sauceCtrl.getOneSauce);
router.post('/', auth.authorise, multer, sauceCtrl.createSauce);
router.put('/:id', auth.authorise, auth.authoriseForSauce, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth.authorise, auth.authoriseForSauce, sauceCtrl.deleteSauce);
router.post('/:id/like', auth.authorise, sauceCtrl.likeSauce);

export default router;