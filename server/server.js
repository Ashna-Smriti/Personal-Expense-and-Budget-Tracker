import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, '.env') });
const app = express();
const PORT = process.env.PORT || 5001;

const corsOrigins = (process.env.CORS_ORIGINS || '')
  .split(',').map(s => s.trim()).filter(Boolean)
  .map(o => o.startsWith('/') && o.endsWith('/') ? new RegExp(o.slice(1, -1)) : o);

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:4173',
    /\.vercel\.app$/,
    /\.railway\.app$/,
    /\.onrender\.com$/,
    /\.netlify\.app$/,
    ...corsOrigins,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not defined. Set it in server/.env');
  process.exit(1);
}

async function start() {
  let mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.log('No MONGODB_URI found, starting in-memory MongoDB...');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    console.log(`In-memory MongoDB running at ${mongoUri}`);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/user', userRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
  });

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
