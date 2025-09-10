import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Import routers
import authRoutes from './routes/auth.routes';
import listenerRoutes from './routes/listeners.routes';
import battleItemRoutes from './routes/battleItems.routes';
import statsRoutes from './routes/stats.routes';

dotenv.config();

const app = express();
const PORT = 5001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  })
);
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/listeners', listenerRoutes);
app.use('/api/battle-items', battleItemRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stats', statsRoutes);

// Error handling
app.use((err: any, req: any, res: any, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
