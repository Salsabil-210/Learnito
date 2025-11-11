import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pool from './config/db';
import authRoutes from './routes/auth.routes';
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(helmet()); 
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.use('/api/auth', authRoutes);

pool.connect()
  .then(() => console.log(' Database connected successfully!'))
  .catch((err) => console.error(' Database connection failed:', err));

app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Learnito Server!',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});


app.listen(PORT, () => {
  console.log(` Learnito server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(` Access at: http://localhost:${PORT}`);
});

export default app;