import { Request, Response } from 'express';
import { jobService } from '../services/jobService';
import { webhookService } from '../services/webhookService';

export const jobController = {
  async createJob(req: Request, res: Response) {
    try {
      const { taskName, payload, priority } = req.body;
      
      if (!taskName || !payload) {
        return res.status(400).json({ error: 'taskName and payload are required' });
      }

      const job = await jobService.createJob(taskName, payload, priority || 'MEDIUM');
      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Failed to create job' });
    }
  },

  async getJobs(req: Request, res: Response) {
    try {
      const { status, priority } = req.query;
      const filters = {
        status: status as string,
        priority: priority as string
      };
      
      const jobs = await jobService.getJobs(filters);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  },

  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Fix: Ensure id is string
      const jobId = Array.isArray(id) ? id[0] : id;
      const job = await jobService.getJobById(jobId);
      
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }
      
      res.json(job);
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  },

  async runJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      // Fix: Ensure id is string
      const jobId = Array.isArray(id) ? id[0] : id;
      
      res.status(202).json({ 
        message: 'Job execution started',
        jobId: jobId 
      });

      setTimeout(async () => {
        try {
          await jobService.updateJobStatus(jobId, 'RUNNING');
          
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          const job = await jobService.updateJobStatus(jobId, 'COMPLETED');
          
          await webhookService.triggerWebhook(job);
          
          console.log("Job " + jobId + " completed successfully");
        } catch (error) {
          console.error("Error running job " + jobId + ":", error);
          await jobService.updateJobStatus(jobId, 'FAILED');
        }
      }, 0);
      
    } catch (error) {
      console.error('Error starting job:', error);
      res.status(500).json({ error: 'Failed to start job' });
    }
  }
};