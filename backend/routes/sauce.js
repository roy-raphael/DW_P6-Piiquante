import express from 'express';
import auth from '../middlewares/auth.js';
import multer from '../middlewares/multer-config.js';
import * as sauceCtrl  from '../controllers/sauce.js';

const router = express.Router();

router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

export default router;