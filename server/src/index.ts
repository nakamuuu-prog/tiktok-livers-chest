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

// Load environment variables from .env file
dotenv.config();

// Initialize Prisma Client based on environment
let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  // Production: Use the DATABASE_URL from environment variables (should be the POOLER URL)
  prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // Development: Use the default SQLite connection string from the schema
  prisma = new PrismaClient();
}

const app = express();

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

// Health check route
app.get('/healthz', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).send('OK');
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).send('Service Unavailable');
  }
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

// Helper function to check if a table exists
async function tableExists(name: string): Promise<boolean> {
  try {
    const result: any[] = await prisma.$queryRawUnsafe(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1);`,
      name
    );
    return result[0]?.exists || false;
  } catch (error) {
    // In development with SQLite, schema is not 'public'. This check is mainly for production.
    if (process.env.NODE_ENV !== 'production') {
        // A simpler check for SQLite, assuming if this fails, table likely doesn't exist.
        try {
            await prisma.$queryRawUnsafe(`SELECT 1 FROM ${name} LIMIT 1`);
            return true;
        } catch (e) {
            return false;
        }
    }
    console.error(`Error checking if table '${name}' exists:`, error);
    return false;
  }
}

// Function to create the initial admin user
async function createInitialAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.log('ADMIN_USERNAME or ADMIN_PASSWORD is not set. Skipping initial admin creation.');
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



// Main bootstrap function to orchestrate the startup sequence
async function bootstrap() {
  // 1. Connect Prisma Client
  try {
    await prisma.$connect();
    console.log('Prisma Client connected successfully.');
  } catch (error) {
    console.error('Failed to connect Prisma Client:', error);
    process.exit(1);
  }

  // 3. Create initial data if tables exist (only in production for now)
  if (process.env.NODE_ENV === 'production') {
      if (await tableExists('users')) {
        await createInitialAdmin();
      } else {
        console.warn("[bootstrap] 'users' table not found, skipping initial admin creation.");
      }
  }

  // 4. Start the HTTP server
  const port = Number(process.env.PORT || 5001);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });

  // 5. Start cron jobs (after ensuring tables exist)
    if (process.env.NODE_ENV === 'production' && !(await tableExists('battle_items'))) {
        console.warn("[bootstrap] 'battle_items' table not found, skipping cron jobs.");
    } else {
        startCronJobs();
    }
}

// Start the application
bootstrap();