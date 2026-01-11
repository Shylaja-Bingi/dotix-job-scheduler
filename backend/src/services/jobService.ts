import prisma from '../utils/database'

export const jobService = {
  async createJob(taskName: string, payload: any, priority: string) {
  // Convert payload to JSON string
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
  
  return await prisma.job.create({
    data: {
      taskName,
      payload: payloadString,
      priority: priority || 'MEDIUM',
      status: 'PENDING'
    }
  });
},

  async getJobs(filters?: { status?: string; priority?: string }) {
    const where: any = {};
    
    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    
    const jobs = await prisma.job.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    // Parse JSON strings back to objects
    return jobs.map(job => ({
      ...job,
      payload: tryParseJSON(job.payload)
    }));
  },

  async getJobById(id: string) {
    const job = await prisma.job.findUnique({
      where: { id }
    });

    if (!job) return null;

    return {
      ...job,
      payload: tryParseJSON(job.payload)
    };
  },

  async updateJobStatus(id: string, status: string) {
    return await prisma.job.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });
  }
};

// Helper function to parse JSON
function tryParseJSON(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}