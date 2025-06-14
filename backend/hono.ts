import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { appRouter } from './trpc/app-router';
import { createContext } from './trpc/create-context';

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Health check endpoint
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'Real Estate API is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount tRPC
app.use('/trpc/*', trpcServer({
  router: appRouter,
  createContext,
}));

export default app;