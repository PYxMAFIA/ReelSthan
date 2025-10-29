import express from 'express'
import creatorController from '../controller/creator.controller.js';
const router = express.Router();

router.get('/creator/:id', creatorController.getCreatorProfileByID);

export default router;