import express from 'express';
import {
    createRecruitment,
    getAllRecruitments,
    getRecruitment,
    updateRecruitment,
    deleteRecruitment
} from '../controllers/recruitmentController.js';

const router = express.Router();

router.route('/')
.post(createRecruitment)
.get(getAllRecruitments);

router.route('/:id')
.get(getRecruitment)
.put(updateRecruitment)
.delete(deleteRecruitment);

export default router;