import express from 'express';
import userMiddleware from '../middlewares/auth.middleware.js';
import ReelController, { toggleLike, addComment, getComments, shareReel, saveReel, getSavedReels } from '../controller/reel.controller.js';
const router = express.Router();
import multer from 'multer';

const upload = multer({
    storage: multer.memoryStorage(),
});

router.post('/', userMiddleware, upload.single("reel"), ReelController.uploadReel)
router.get('/', ReelController.getReel)
router.post('/:id/like', userMiddleware, toggleLike)
router.post('/:id/comment', userMiddleware, addComment)
router.get('/:id/comments', getComments)
router.post('/:id/save', userMiddleware, saveReel)
router.post('/:id/share', shareReel)
router.get('/saved/me', userMiddleware, getSavedReels)


export default router;