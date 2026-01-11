import { Router } from 'express';
import { jobController } from '../controllers/jobController';

const router = Router();

router.post('/jobs', jobController.createJob);
router.get('/jobs', jobController.getJobs);
router.get('/jobs/:id', jobController.getJobById);
router.post('/run-job/:id', jobController.runJob);

export default router;