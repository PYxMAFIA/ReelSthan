import express from 'express'
const router = express.Router();
import authController, { getMyProfile, updateMyProfile } from "../controller/auth.controller.js";
import userMiddleware from '../middlewares/auth.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });


router.get('/check-auth', userMiddleware, authController.checkAuth);
router.post('/register', authController.registryUser);
router.post('/login', authController.loginUser);
router.post('/logout', authController.logoutUser);
router.post('/forget-password', authController.forgetPassword);
router.post('/forget-reset/:token', authController.resetPassword);

// Profile routes
router.get('/profile/me', userMiddleware, getMyProfile);
router.put('/profile', userMiddleware, upload.single('avatar'), updateMyProfile);






export default router;