import express from 'express';
import {
    createRecruitment,
    getAllRecruitments,
    getRecruitment,
    updateRecruitment,
    deleteRecruitment
} from '../controllers/recruitmentController.js';
import Job from '../models/JobPostingRecruiment.js';
import Application from '../models/Application.js'

const router = express.Router();

router.route('/')
.post(createRecruitment)
.get(getAllRecruitments);

router.route('/:id')
.get(getRecruitment)
.put(updateRecruitment)
.delete(deleteRecruitment);

router.route('/jobs')
.post(async(req, res) =>{
    try {
        const job = await Job.create(req.body);
        res.status(201).json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
})
.get(async (req, res) => {
    try {
        const jobs = await Job.find({ isActive: true })
        .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error) {
        res.status(500) ({ message: error.message });
    }
});

router.post('/application', async (req, res) => {
    try {
        const application = await Application.create(req.body);
        res.status(201).json({ message: 'Application submitted', application });
    } catch (error) {
        res.status(400).json({ messsage: error.message });
    }
});

router.get('/application/job/:jobId', async (req, res) => {
    try {
        const applications = await Application.find({jobId: req.params.jobId })
        .sort({ createdAt: -1});
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;