import express from 'express';

const router = express.Router();

import * as userCtrl  from '../controllers/user.js';
import validatePassword from '../middlewares/password-validator.js';

router.post('/signup', validatePassword, userCtrl.signup);
router.post('/login', userCtrl.loginRateLimiter, userCtrl.login);

export default router;