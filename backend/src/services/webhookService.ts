import axios from 'axios';
import prisma from '../utils/database'

export const webhookService = {
  async triggerWebhook(job: any) {
    const webhookUrl = process.env.WEBHOOK_URL || 'https://webhook.site/f3d2e1c0-1234-5678-90ab-cdef12345678';
    
    const payload = {
      jobId: job.id,
      taskName: job.taskName,
      priority: job.priority,
      payload: job.payload,
      completedAt: new Date().toISOString()
    };

    try {
      const response = await axios.post(webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' }
      });

      // Log webhook
      await prisma.webhookLog.create({
        data: {
          jobId: job.id,
          url: webhookUrl,
          payload: JSON.stringify(payload),
          response: JSON.stringify(response.data),
          status: response.status
        }
      });

      console.log("Webhook sent for job " + job.id);
      return true;
    } catch (error: any) {
      // Log failed webhook
      await prisma.webhookLog.create({
        data: {
          jobId: job.id,
          url: webhookUrl,
          payload: JSON.stringify(payload),
          response: JSON.stringify(error.response?.data || { error: error.message }),
          status: error.response?.status || 500
        }
      });

      console.log("Webhook failed for job " + job.id + ":", error.message);
      return false;
    }
  }
};