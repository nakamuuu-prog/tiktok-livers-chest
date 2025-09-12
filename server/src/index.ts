import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Import cron jobs
import { startCronJobs } from './cron/jobs';

// Import routers
import authRoutes from './routes/auth.routes';
import listenerRoutes from './routes/listeners.routes';
import battleItemRoutes from './routes/battleItems.routes';
import statsRoutes from './routes/stats.routes';
import adminRoutes from './routes/admin.routes';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, `../.env.${process.env.NODE_ENV || 'development'}`),
});

const prisma = new PrismaClient();

async function createInitialAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.log(
      'ADMIN_USERNAME or ADMIN_PASSWORD is not set. Skipping initial admin creation.'
    );
    return;
  }

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (existingAdmin) {
      console.log('Admin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        username: adminUsername,
        password: hashedPassword,
        isActive: true,
        isAdmin: true,
      },
    });
    console.log('Initial admin user created successfully.');
  } catch (error) {
    console.error('Error creating initial admin user:', error);
  }
}

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(morgan('combined'));
app.use(express.json());

// Health check route for Render
app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send('OK');
});

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/listeners', listenerRoutes);
app.use('/api/battle-items', battleItemRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const port = Number(PORT);

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
  createInitialAdmin();
  startCronJobs(); // Start the cron jobs
});