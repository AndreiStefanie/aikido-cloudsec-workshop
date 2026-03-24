import cors from 'cors';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ZodError } from 'zod';

import { env } from './config/env.js';
import { createRepository } from './db/repository.js';
import { createAdminRouter } from './modules/admin/routes.js';
import { createLeaderboardRouter } from './modules/leaderboard/routes.js';
import { createPlayerRouter } from './modules/player/routes.js';

const repository = createRepository();
const app = express();
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const playerDistDir = path.resolve(currentDir, '../../player/dist');
const adminDistDir = path.resolve(currentDir, '../../admin/dist');
const playerIndexPath = path.join(playerDistDir, 'index.html');
const adminIndexPath = path.join(adminDistDir, 'index.html');

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS.split(',').map(value => value.trim()),
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_request, response) => {
  response.json({ ok: true });
});

app.use('/api/player', createPlayerRouter(repository));
app.use('/api/leaderboard', createLeaderboardRouter(repository));
app.use('/api/admin', createAdminRouter(repository));

app.use('/admin', express.static(adminDistDir, { index: false }));
app.use(express.static(playerDistDir, { index: false }));

app.use('/admin', (request, response, next) => {
  if (
    request.method !== 'GET' ||
    !request.accepts('html') ||
    request.path.includes('.')
  ) {
    next();
    return;
  }

  response.sendFile(adminIndexPath);
});

app.use((request, response, next) => {
  if (
    request.method !== 'GET' ||
    request.path.startsWith('/api/') ||
    request.path.startsWith('/admin') ||
    !request.accepts('html') ||
    request.path.includes('.')
  ) {
    next();
    return;
  }

  response.sendFile(playerIndexPath);
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    _next: NextFunction
  ) => {
    if (error instanceof ZodError) {
      response.status(400).json({ message: 'Invalid request payload' });
      return;
    }

    console.error(error);
    response.status(500).json({ message: 'Internal server error' });
  }
);

const server = app.listen(env.PORT, (error?: Error) => {
  if (error) {
    throw error;
  }

  console.log(`API listening on http://localhost:${env.PORT}`);
});

server.on('error', error => {
  throw error;
});
