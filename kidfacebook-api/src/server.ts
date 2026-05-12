import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { generateRoutes } from './routes/generate';
import { ApiResponse } from './types';

dotenv.config();

const dirs = [
  process.env.UPLOAD_DIR || './uploads',
  process.env.TEMP_DIR || './temp',
  process.env.OUTPUT_DIR || './output',
];

dirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

const app: Express = express();
const PORT = process.env.PORT || 3001;

function parseCorsAllowlist(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw?.trim()) return [];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

/** Запросы из клиента VK / VK Mini Apps Hosting */
function isVkClientOrigin(origin: string): boolean {
  try {
    const { hostname } = new URL(origin);
    return (
      hostname === 'vk.com' ||
      hostname === 'm.vk.ru' ||
      hostname.endsWith('.vk.com') ||
      hostname.endsWith('.vk-apps.com')
    );
  } catch {
    return false;
  }
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Локально — любой origin (Vite 10888 и т.д.)
      if (process.env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }
      const allowlist = parseCorsAllowlist();
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowlist.includes(origin) || isVkClientOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  }),
);

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/output', express.static(path.join(process.cwd(), 'output')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api', generateRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
  });
});

app.use((_req: Request, res: Response) => {
  const response: ApiResponse = {
    success: false,
    error: 'Route not found',
  };
  res.status(404).json(response);
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('❌ Error:', err);

  const response: ApiResponse = {
    success: false,
    error:
      process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  };

  res.status(500).json(response);
});

app.listen(PORT, () => {
  console.log(`
🚀 KidFaceBook API Server Started!
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📁 Upload Dir: ${process.env.UPLOAD_DIR}
📁 Output Dir: ${process.env.OUTPUT_DIR}
  `);
});

export default app;
