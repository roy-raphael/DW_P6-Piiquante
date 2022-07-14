import express from 'express';
import auth from '../middlewares/auth.js';
import authoriseForSauce from '../middlewares/auth-sauce.js';
import multer from '../middlewares/multer-config.js';
import resizeImage from '../middlewares/image-resize.js';
import * as sauceCtrl  from '../controllers/sauce.js';

const router = express.Router();

router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, resizeImage, sauceCtrl.createSauce);
router.put('/:id', auth, authoriseForSauce, multer, resizeImage, sauceCtrl.modifySauce);
router.delete('/:id', auth, authoriseForSauce, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

export default router;