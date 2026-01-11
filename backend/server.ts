import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jobRoutes from './src/routes/jobRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api', jobRoutes);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Job Scheduler API is running',
    version: '1.0.0',
    endpoints: [
      'POST /api/jobs - Create job',
      'GET /api/jobs - List jobs',
      'GET /api/jobs/:id - Get job details',
      'POST /api/run-job/:id - Run job'
    ]
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});